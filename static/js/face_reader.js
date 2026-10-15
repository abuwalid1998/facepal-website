/**
 * FaceReader Biometric Controller
 * Handles Camera feed, Live Face Detection HUD Canvas Tracking, 10-Second countdown timer,
 * Anti-spoofing alert ("X" mark), and FacePal payment communication.
 */

class FaceReaderController {
    constructor() {
        this.video = document.getElementById("checkoutCameraVideo");
        this.canvas = document.getElementById("checkoutOverlayCanvas");
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
        
        this.stream = null;
        this.scanInterval = null;
        this.countdownInterval = null;
        this.hudAnimationId = null;
        this.remainingSeconds = 10;
        this.isProcessingFrame = false;
        this.paymentCompleted = false;
        this.audioCtx = null;
        this.lastDetectedBbox = null; // [x, y, w, h] from backend

        this.bindFallbackUpload();
        this.bindSimulationControls();
    }

    initAudio() {
        if (!this.audioCtx) {
            try {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log("Web Audio not supported", e);
            }
        }
    }

    playTone(freq, type = "sine", duration = 0.15) {
        try {
            this.initAudio();
            if (!this.audioCtx) return;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {}
    }

    playSuccessChime() {
        setTimeout(() => this.playTone(523.25, "triangle", 0.18), 0);
        setTimeout(() => this.playTone(659.25, "triangle", 0.18), 120);
        setTimeout(() => this.playTone(783.99, "triangle", 0.35), 240);
    }

    playSpoofAlertTone() {
        // Severe alert buzz for presentation attack / spoofing
        this.playTone(150, "sawtooth", 0.4);
        setTimeout(() => this.playTone(130, "sawtooth", 0.5), 180);
    }

    bindFallbackUpload() {
        const fileInput = document.getElementById("checkoutFaceFileInput");
        const uploadBtn = document.getElementById("checkoutUploadPhotoBtn");

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener("click", () => fileInput.click());
            fileInput.addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const base64Data = evt.target.result;
                    this.verifySingleFrame(base64Data);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    bindSimulationControls() {
        const spoofBtn = document.getElementById("simulateSpoofBtn");
        const successBtn = document.getElementById("simulateSuccessBtn");

        if (spoofBtn) {
            spoofBtn.addEventListener("click", () => {
                if (window.FacePalStore) {
                    const res = window.FacePalStore.verifyBiometricPayment(this.amount, this.items, true);
                    this.handleVerificationResult(res);
                }
            });
        }

        if (successBtn) {
            successBtn.addEventListener("click", () => {
                if (window.FacePalStore) {
                    const res = window.FacePalStore.verifyBiometricPayment(this.amount, this.items, false);
                    this.handleVerificationResult(res);
                }
            });
        }
    }

    async startCheckoutScanner(amount, items) {
        this.paymentCompleted = false;
        this.isProcessingFrame = false;
        this.remainingSeconds = 10;
        this.amount = amount;
        this.items = items;
        this.lastDetectedBbox = null;

        this.resetOverlays();
        this.updateCountdownDisplay(10);

        // Ensure video element properties
        if (this.video) {
            this.video.muted = true;
            this.video.setAttribute("muted", "");
            this.video.setAttribute("playsinline", "");
            this.video.setAttribute("autoplay", "");
        }

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API not available in this browser context.");
            }

            // Request user media
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
                audio: false
            });
            this.video.srcObject = this.stream;
            
            // Safe video start with Promise.race - NEVER hang!
            await Promise.race([
                this.video.play().catch(e => console.warn("[FaceReader] video.play notice:", e)),
                new Promise(resolve => setTimeout(resolve, 600))
            ]);

            this.resizeOverlayCanvas();
            this.startHudRenderingLoop();
            console.log("[FaceReader] Live camera feed running, resolution:", this.video.videoWidth, "x", this.video.videoHeight);
        } catch (err) {
            console.warn("[FaceReader] Live camera access failed or unavailable:", err);
            const instruction = document.getElementById("scannerInstructionText");
            if (instruction) {
                instruction.innerHTML = `⚠️ <strong>Camera access unavailable (${err.name || err.message}).</strong> You can upload a face photo using the button below to complete FacePal checkout.`;
            }
        }

        // Start 10-Second Timer
        this.startCountdown();

        // Immediate first capture attempt once stream starts
        setTimeout(() => {
            if (!this.paymentCompleted) this.captureAndVerify();
        }, 500);

        // Start Continuous Verification Loop (every 500ms)
        this.scanInterval = setInterval(() => {
            if (!this.isProcessingFrame && !this.paymentCompleted) {
                this.captureAndVerify();
            }
        }, 500);
    }

    resizeOverlayCanvas() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.parentElement.clientWidth || 540;
        this.canvas.height = this.canvas.parentElement.clientHeight || 320;
    }

    startHudRenderingLoop() {
        const render = () => {
            if (!this.stream || this.paymentCompleted) return;

            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // If backend detected a face, draw live tracking bounding box
                if (this.lastDetectedBbox && this.video.videoWidth > 0) {
                    const [bx, by, bw, bh] = this.lastDetectedBbox;
                    const scaleX = this.canvas.width / this.video.videoWidth;
                    const scaleY = this.canvas.height / this.video.videoHeight;

                    // Mirrored coordinates because video is mirrored
                    const canvasX = this.canvas.width - (bx * scaleX) - (bw * scaleX);
                    const canvasY = by * scaleY;
                    const canvasW = bw * scaleX;
                    const canvasH = bh * scaleY;

                    // Draw glowing biometric targeting frame
                    this.ctx.strokeStyle = "rgba(223, 109, 111, 0.9)";
                    this.ctx.lineWidth = 2;
                    this.ctx.shadowColor = "rgba(223, 109, 111, 0.8)";
                    this.ctx.shadowBlur = 10;
                    this.ctx.strokeRect(canvasX, canvasY, canvasW, canvasH);

                    // Corner brackets
                    const cornerLen = 14;
                    this.ctx.strokeStyle = "#ffffff";
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    // Top Left
                    this.ctx.moveTo(canvasX, canvasY + cornerLen);
                    this.ctx.lineTo(canvasX, canvasY);
                    this.ctx.lineTo(canvasX + cornerLen, canvasY);
                    // Top Right
                    this.ctx.moveTo(canvasX + canvasW - cornerLen, canvasY);
                    this.ctx.lineTo(canvasX + canvasW, canvasY);
                    this.ctx.lineTo(canvasX + canvasW, canvasY + cornerLen);
                    // Bottom Left
                    this.ctx.moveTo(canvasX, canvasY + canvasH - cornerLen);
                    this.ctx.lineTo(canvasX, canvasY + canvasH);
                    this.ctx.lineTo(canvasX + cornerLen, canvasY + canvasH);
                    // Bottom Right
                    this.ctx.moveTo(canvasX + canvasW - cornerLen, canvasY + canvasH);
                    this.ctx.lineTo(canvasX + canvasW, canvasY + canvasH);
                    this.ctx.lineTo(canvasX + canvasW, canvasY + canvasH - cornerLen);
                    this.ctx.stroke();

                    // Biometric label
                    this.ctx.font = "11px Inter, sans-serif";
                    this.ctx.fillStyle = "#ffffff";
                    this.ctx.fillText("FACIAL BIOMETRIC LOCK", canvasX, canvasY - 6);
                }
            }

            this.hudAnimationId = requestAnimationFrame(render);
        };

        this.hudAnimationId = requestAnimationFrame(render);
    }

    startCountdown() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        const circle = document.getElementById("timerCircleProgress");
        const totalCircumference = 283; // 2 * PI * 45

        this.countdownInterval = setInterval(() => {
            this.remainingSeconds -= 1;
            this.updateCountdownDisplay(this.remainingSeconds);

            // Update SVG circle stroke
            if (circle) {
                const offset = totalCircumference - (this.remainingSeconds / 10) * totalCircumference;
                circle.style.strokeDashoffset = offset;
                if (this.remainingSeconds <= 3) {
                    circle.style.stroke = "var(--color-error)";
                } else {
                    circle.style.stroke = "var(--color-accent)";
                }
            }

            // Play subtle tick sound
            this.playTone(850, "sine", 0.03);

            // If 10 seconds elapse with NO face detected -> close and refresh page!
            if (this.remainingSeconds <= 0) {
                clearInterval(this.countdownInterval);
                this.stopScanner();
                this.handleTimeout();
            }
        }, 1000);
    }

    updateCountdownDisplay(sec) {
        const numElem = document.getElementById("countdownNumber");
        if (numElem) numElem.innerText = Math.max(0, sec);
    }

    handleTimeout() {
        const instruction = document.getElementById("scannerInstructionText");
        if (instruction) {
            instruction.innerHTML = `<span style="color:var(--color-error);font-weight:700;">⏳ 10 Seconds Elapsed: No face recognized. Refreshing page...</span>`;
        }
        setTimeout(() => {
            window.location.reload();
        }, 1200);
    }

    resetOverlays() {
        document.getElementById("spoofAlertOverlay").classList.remove("active");
        document.getElementById("paymentSuccessOverlay").classList.remove("active");
        document.getElementById("unregisteredAlertOverlay").classList.remove("active");
        document.getElementById("hudStatusText").innerText = "Detecting Face...";
        document.getElementById("hudDetectionStatus").style.borderColor = "rgba(255, 255, 255, 0.2)";
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    stopScanner() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        if (this.hudAnimationId) {
            cancelAnimationFrame(this.hudAnimationId);
            this.hudAnimationId = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    grabFrameBase64() {
        if (!this.video) return null;
        const vw = this.video.videoWidth;
        const vh = this.video.videoHeight;
        if (!vw || !vh) return null;

        try {
            const offCanvas = document.createElement("canvas");
            offCanvas.width = vw;
            offCanvas.height = vh;
            const offCtx = offCanvas.getContext("2d");
            offCtx.drawImage(this.video, 0, 0, vw, vh);
            return offCanvas.toDataURL("image/jpeg", 0.85);
        } catch (e) {
            console.error("[FaceReader] Frame grab error:", e);
            return null;
        }
    }

    async captureAndVerify() {
        if (this.isProcessingFrame || this.paymentCompleted) return;
        const frameData = this.grabFrameBase64();
        if (!frameData) return;
        await this.verifySingleFrame(frameData);
    }

    async verifySingleFrame(base64Image) {
        this.isProcessingFrame = true;
        const statusText = document.getElementById("hudStatusText");
        if (statusText) statusText.innerText = "Analyzing Face Biometrics...";

        try {
            const resp = await fetch("/api/payment/verify-facepal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image_data: base64Image,
                    amount: this.amount,
                    items: this.items
                })
            });

            if (!resp.ok) throw new Error("Backend payment API error");
            const result = await resp.json();
            console.log("[FaceReader] Verification response:", result.status, result);
            this.handleVerificationResult(result);
        } catch (err) {
            console.warn("[FaceReader] Falling back to client simulator (GitHub Pages Demo Mode):", err);
            if (window.FacePalStore) {
                const result = window.FacePalStore.verifyBiometricPayment(this.amount, this.items, false);
                this.handleVerificationResult(result);
            }
        } finally {
            this.isProcessingFrame = false;
        }
    }

    handleVerificationResult(result) {
        const status = result.status;
        const instruction = document.getElementById("scannerInstructionText");
        const statusText = document.getElementById("hudStatusText");

        // Update face bounding box if detected
        if (result.bbox) {
            this.lastDetectedBbox = result.bbox;
        }

        if (status === "NO_FACE") {
            this.lastDetectedBbox = null;
            if (statusText) statusText.innerText = "Searching for Face...";
            if (instruction) instruction.innerText = "Please center your face inside the FacePal scanner.";
            return;
        }

        // =========================================================================
        // CRITICAL REQUIREMENT: SPOOFING DETECTED -> SHOW "X" MARK ALERT & CLOSE POPUP
        // =========================================================================
        if (status === "SPOOF_DETECTED") {
            this.paymentCompleted = true;
            this.stopScanner();
            this.playSpoofAlertTone();

            // Display prominent "X" spoof alert overlay
            const spoofOverlay = document.getElementById("spoofAlertOverlay");
            const spoofDesc = document.getElementById("spoofAlertDesc");
            if (spoofDesc) {
                spoofDesc.innerText = result.message || "SECURITY ALERT: Spoofing detected! Presentation attack blocked. Payment aborted.";
            }
            if (spoofOverlay) spoofOverlay.classList.add("active");

            // Close popup after 2.8 seconds
            setTimeout(() => {
                if (window.juthoorApp) {
                    window.juthoorApp.closePaymentModal();
                }
            }, 2800);
            return;
        }

        // =========================================================================
        // UNREGISTERED FACE: PAYMENT NOT ALLOWED
        // =========================================================================
        if (status === "NOT_REGISTERED") {
            const unregOverlay = document.getElementById("unregisteredAlertOverlay");
            if (unregOverlay) unregOverlay.classList.add("active");
            if (instruction) instruction.innerText = "Face not recognized. Payment strictly restricted to registered users.";
            return;
        }

        // =========================================================================
        // RECOGNIZED REGISTERED FACE -> PROCEED TO PAYPAL DEDUCTION
        // =========================================================================
        if (status === "RECOGNIZED") {
            this.paymentCompleted = true;
            this.stopScanner();

            if (result.success) {
                // Payment Successful
                this.playSuccessChime();
                const successOverlay = document.getElementById("paymentSuccessOverlay");
                const details = result.payment_details;

                document.getElementById("receiptCustomerName").innerText = result.customer_name || "Valued Customer";
                document.getElementById("receiptPayPalEmail").innerText = details.paypal_account || "-";
                document.getElementById("receiptAmountDeducted").innerText = `$${parseFloat(details.amount_deducted).toFixed(2)}`;
                document.getElementById("receiptNewBalance").innerText = `$${parseFloat(details.new_balance).toFixed(2)}`;
                document.getElementById("receiptTxId").innerText = details.transaction_id || "-";

                if (successOverlay) successOverlay.classList.add("active");

                // Clear shopping cart & refresh dashboard data
                if (window.juthoorApp) {
                    window.juthoorApp.clearCart();
                }
                if (window.dashboardController) {
                    window.dashboardController.loadAll();
                }

                // Close modal after showing receipt for 5 seconds
                setTimeout(() => {
                    if (window.juthoorApp) {
                        window.juthoorApp.closePaymentModal();
                    }
                }, 5000);
            } else {
                // Insufficient Balance or other error
                this.playTone(220, "sawtooth", 0.3);
                if (instruction) {
                    instruction.innerHTML = `<span style="color:var(--color-error); font-weight:700;">⚠️ ${result.message}</span>`;
                }
            }
        }
    }
}

// Global instance
window.faceReader = new FaceReaderController();
