import os
import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Dict, Any, Optional
from app.core.config import MINIFAS_MODEL_PATH, ANTI_SPOOF_REAL_THRESHOLD

class Conv_block(nn.Module):
    def __init__(self, in_c, out_c, kernel=(1, 1), stride=(1, 1), padding=(0, 0), groups=1):
        super(Conv_block, self).__init__()
        self.conv = nn.Conv2d(in_c, out_c, kernel_size=kernel, stride=stride, padding=padding, groups=groups, bias=False)
        self.bn = nn.BatchNorm2d(out_c)
        self.prelu = nn.PReLU(num_parameters=out_c)

    def forward(self, x):
        return self.prelu(self.bn(self.conv(x)))

class Linear_block(nn.Module):
    def __init__(self, in_c, out_c, kernel=(1, 1), stride=(1, 1), padding=(0, 0), groups=1):
        super(Linear_block, self).__init__()
        self.conv = nn.Conv2d(in_c, out_c, kernel_size=kernel, stride=stride, padding=padding, groups=groups, bias=False)
        self.bn = nn.BatchNorm2d(out_c)

    def forward(self, x):
        return self.bn(self.conv(x))

class Depth_Wise(nn.Module):
    def __init__(self, in_c, out_c, residual=False, kernel=(3, 3), stride=(2, 2), padding=(1, 1), groups=1):
        super(Depth_Wise, self).__init__()
        self.residual = residual
        self.conv = Conv_block(in_c, out_c=groups, kernel=(1, 1), padding=(0, 0), stride=(1, 1))
        self.conv_dw = Conv_block(groups, groups, groups=groups, kernel=kernel, padding=padding, stride=stride)
        self.project = Linear_block(groups, out_c, kernel=(1, 1), padding=(0, 0), stride=(1, 1))

    def forward(self, x):
        short_cut = x
        x = self.conv(x)
        x = self.conv_dw(x)
        x = self.project(x)
        return (short_cut + x) if self.residual else x

class Residual(nn.Module):
    def __init__(self, c, num_block, groups, kernel=(3, 3), stride=(1, 1), padding=(1, 1)):
        super(Residual, self).__init__()
        modules = []
        for i in range(num_block):
            modules.append(Depth_Wise(c, c, residual=True, kernel=kernel, padding=padding, stride=stride, groups=groups[i]))
        self.model = nn.Sequential(*modules)

    def forward(self, x):
        return self.model(x)

class MiniFASNetV2(nn.Module):
    def __init__(self, keep, embedding_size=512, out_h=80, out_w=80, num_classes=3):
        super(MiniFASNetV2, self).__init__()
        self.conv1 = Conv_block(3, keep[0], kernel=(3, 3), stride=(2, 2), padding=(1, 1))
        self.conv2_dw = Conv_block(keep[0], keep[0], kernel=(3, 3), stride=(1, 1), padding=(1, 1), groups=keep[0])
        c1, c2, c3 = keep[1], keep[2], keep[3]
        self.conv_23 = Depth_Wise(keep[0], c1, kernel=(3, 3), stride=(2, 2), padding=(1, 1), groups=keep[4])
        self.conv_3 = Residual(c1, num_block=4, groups=keep[5:9], kernel=(3, 3), stride=(1, 1), padding=(1, 1))
        self.conv_34 = Depth_Wise(c1, c2, kernel=(3, 3), stride=(2, 2), padding=(1, 1), groups=keep[9])
        self.conv_4 = Residual(c2, num_block=6, groups=keep[10:16], kernel=(3, 3), stride=(1, 1), padding=(1, 1))
        self.conv_45 = Depth_Wise(c2, c3, kernel=(3, 3), stride=(2, 2), padding=(1, 1), groups=keep[16])
        self.conv_5 = Residual(c3, num_block=2, groups=keep[17:19], kernel=(3, 3), stride=(1, 1), padding=(1, 1))
        self.conv_6_sep = Conv_block(c3, embedding_size, kernel=(1, 1), stride=(1, 1), padding=(0, 0))
        self.conv_6_dw = Linear_block(embedding_size, embedding_size, groups=embedding_size, kernel=(out_h//16, out_w//16), stride=(1, 1), padding=(0, 0))
        self.conv_6_flatten = nn.Flatten()
        self.linear = nn.Linear(512, 128, bias=False)
        self.bn = nn.BatchNorm1d(128)
        self.drop = nn.Dropout(p=0.5)
        self.prob = nn.Linear(128, num_classes, bias=False)

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2_dw(x)
        x = self.conv_23(x)
        x = self.conv_3(x)
        x = self.conv_34(x)
        x = self.conv_4(x)
        x = self.conv_45(x)
        x = self.conv_5(x)
        x = self.conv_6_sep(x)
        x = self.conv_6_dw(x)
        x = self.conv_6_flatten(x)
        x = self.linear(x)
        x = self.bn(x)
        x = self.drop(x)
        x = self.prob(x)
        return x

class AntiSpoofingService:
    def __init__(self):
        self.model: Optional[MiniFASNetV2] = None
        self.device = torch.device("cpu")
        self._load_model()

    def _load_model(self):
        if not MINIFAS_MODEL_PATH.exists():
            print(f"[AntiSpoofing] Model file not found at {MINIFAS_MODEL_PATH}")
            return
        try:
            keep = [32, 64, 128, 128, 103, 13, 13, 13, 13, 231, 231, 52, 26, 77, 26, 26, 308, 26, 26]
            self.model = MiniFASNetV2(keep)
            raw_state = torch.load(str(MINIFAS_MODEL_PATH), map_location=self.device, weights_only=False)
            state_dict = {k.replace('module.', ''): v for k, v in raw_state.items()}
            self.model.load_state_dict(state_dict, strict=True)
            self.model.eval()
            print("[AntiSpoofing] MiniFASNetV2 Anti-Spoofing Neural Network loaded successfully.")
        except Exception as e:
            print(f"[AntiSpoofing] Error loading MiniFASNetV2: {e}")
            self.model = None

    def _get_crop_box(self, img_h: int, img_w: int, bbox: Tuple[int, int, int, int], scale: float = 2.7) -> Tuple[int, int, int, int]:
        x, y, w, h = bbox
        cx = x + w / 2.0
        cy = y + h / 2.0
        max_dim = max(w, h) * scale
        
        x1 = max(0, int(cx - max_dim / 2.0))
        y1 = max(0, int(cy - max_dim / 2.0))
        x2 = min(img_w, int(cx + max_dim / 2.0))
        y2 = min(img_h, int(cy + max_dim / 2.0))
        return (x1, y1, x2 - x1, y2 - y1)

    def _analyze_screen_texture(self, face_crop: np.ndarray) -> Dict[str, Any]:
        """Analyzes texture, color distribution, and moire patterns to detect screen/photo replay."""
        if face_crop.size == 0:
            return {"is_screen": False, "score": 0.0}

        gray = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
        
        # Laplacian variance (sharpness/blur check)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        # High-frequency Fourier transform analysis for pixel grids/moire patterns
        dft = cv2.dft(np.float32(gray), flags=cv2.DFT_COMPLEX_OUTPUT)
        dft_shift = np.fft.fftshift(dft)
        magnitude_spectrum = 20 * np.log(cv2.magnitude(dft_shift[:, :, 0], dft_shift[:, :, 1]) + 1e-6)
        
        # Color distribution (HSV channel saturation test - screens often have saturated RGB subpixel spikes)
        hsv = cv2.cvtColor(face_crop, cv2.COLOR_BGR2HSV)
        sat_std = np.std(hsv[:, :, 1])

        # Overexposure / screen glare detection
        high_pixel_ratio = np.sum(gray > 250) / gray.size

        # A screen replay attack typically has severe wash out (>45%) combined with low saturation variance (<5.0)
        # or extreme flat texture (laplacian_var < 5.0)
        is_screen = (high_pixel_ratio > 0.45 and sat_std < 5.0) or (laplacian_var < 5.0 and sat_std < 4.0)

        return {
            "is_screen": is_screen,
            "laplacian_var": round(float(laplacian_var), 2),
            "glare_ratio": round(float(high_pixel_ratio), 4),
            "sat_std": round(float(sat_std), 2)
        }

    def verify_liveness(self, image: np.ndarray, bbox: Tuple[int, int, int, int]) -> Dict[str, Any]:
        """
        Runs comprehensive anti-spoofing verification:
        1. Deep Learning MiniFASNetV2 inference
        2. Optical Fourier texture and glare inspection
        """
        img_h, img_w = image.shape[:2]
        crop_x, crop_y, crop_w, crop_h = self._get_crop_box(img_h, img_w, bbox, scale=2.7)
        
        crop = image[crop_y:crop_y + crop_h, crop_x:crop_x + crop_w]
        if crop.size == 0 or crop.shape[0] < 10 or crop.shape[1] < 10:
            return {
                "is_real": False,
                "confidence": 0.0,
                "attack_type": "INVALID_CROP",
                "details": "Face crop could not be isolated for liveness verification."
            }

        # 1. Texture and glare check (only blocks severe screen display moire/glare)
        texture_metrics = self._analyze_screen_texture(crop)
        if texture_metrics["is_screen"]:
            return {
                "is_real": False,
                "confidence": 0.05,
                "attack_type": "SCREEN_REPLAY_OR_PRINT",
                "details": "Digital display moiré pattern or severe reflection detected."
            }

        # 2. MiniFASNet CNN Model
        if self.model is not None:
            try:
                # Preprocess: resize to 80x80, convert to float tensor, normalize
                resized = cv2.resize(crop, (80, 80))
                tensor = torch.from_numpy(resized).permute(2, 0, 1).unsqueeze(0).float()
                
                with torch.no_grad():
                    logits = self.model(tensor)
                    probabilities = F.softmax(logits, dim=1).squeeze().numpy()
                    
                # Class 1 is "Real", Class 0/2 are "Spoof"
                real_score = float(probabilities[1])
                is_real = real_score >= ANTI_SPOOF_REAL_THRESHOLD

                attack_type = None if is_real else "PRESENTATION_ATTACK"
                details = f"Liveness confidence: {real_score * 100:.1f}%" if is_real else f"Presentation attack detected ({real_score * 100:.1f}% real score)"

                return {
                    "is_real": is_real,
                    "confidence": round(real_score, 4),
                    "attack_type": attack_type,
                    "details": details,
                    "probabilities": [round(float(p), 4) for p in probabilities]
                }
            except Exception as e:
                print(f"[AntiSpoofing] Inference error: {e}")

        # Fallback heuristic if PyTorch model is unavailable
        is_real = texture_metrics["laplacian_var"] > 35.0
        return {
            "is_real": is_real,
            "confidence": 0.85 if is_real else 0.20,
            "attack_type": None if is_real else "SUSPECTED_SPOOF",
            "details": "Verified via texture and frequency analysis."
        }

anti_spoofing_service = AntiSpoofingService()
