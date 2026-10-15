/**
 * Dashboard Controller
 * Fetches analytics, transactions ledger, recognized face database, and security logs
 */

class DashboardController {
    constructor() {
        this.initTabs();
        this.bindEvents();
    }

    initTabs() {
        const tabs = document.querySelectorAll(".dash-tab-btn");
        tabs.forEach(btn => {
            btn.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".dash-tab-content").forEach(c => c.classList.remove("active"));
                btn.classList.add("active");
                const targetId = btn.getAttribute("data-tab");
                const targetContent = document.getElementById(targetId);
                if (targetContent) targetContent.classList.add("active");
            });
        });
    }

    bindEvents() {
        const refreshBtn = document.getElementById("refreshDashboardBtn");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => {
                this.loadAll();
            });
        }
    }

    async loadAll() {
        await Promise.all([
            this.loadStats(),
            this.loadTransactions(),
            this.loadCustomers(),
            this.loadLogs()
        ]);
        if (window.lucide) window.lucide.createIcons();
    }

    async loadStats() {
        try {
            const res = await fetch("/api/dashboard/stats");
            if (!res.ok) throw new Error("Backend API unavailable");
            const data = await res.json();
            this.renderStats(data);
        } catch (e) {
            if (window.FacePalStore) {
                this.renderStats(window.FacePalStore.getStats());
            }
        }
    }

    renderStats(data) {
        document.getElementById("dashTotalSales").innerText = `$${parseFloat(data.total_sales || 0).toFixed(2)}`;
        document.getElementById("dashCompletedCount").innerText = data.completed_count || 0;
        document.getElementById("dashSpoofCount").innerText = data.spoof_count || 0;
        document.getElementById("dashUserCount").innerText = data.registered_users || 0;
    }

    async loadTransactions() {
        try {
            const res = await fetch("/api/dashboard/transactions");
            if (!res.ok) throw new Error("Backend API unavailable");
            const data = await res.json();
            this.renderTransactions(data.transactions || []);
        } catch (e) {
            if (window.FacePalStore) {
                this.renderTransactions(window.FacePalStore.getTransactions());
            }
        }
    }

    renderTransactions(list) {
        const tbody = document.getElementById("dashTxTableBody");
        if (!tbody) return;

        tbody.innerHTML = "";
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--color-text-muted);">No transactions recorded yet.</td></tr>`;
            return;
        }

        list.forEach(tx => {
            const tr = document.createElement("tr");
            const isCompleted = tx.status === "COMPLETED";
            const isBlocked = tx.status === "BLOCKED_SPOOF";
            
            const statusBadgeClass = isCompleted ? "completed" : (isBlocked ? "blocked" : "warning");
            const customerName = tx.full_name || "Unrecognized Visitor";
            const avatar = tx.face_image_path ? `<img src="${tx.face_image_path}" class="table-face-avatar" alt="${customerName}">` : `<i data-lucide="user" style="width:24px;height:24px;opacity:0.4;"></i>`;
            const bioConf = tx.biometric_confidence ? `${(tx.biometric_confidence * 100).toFixed(1)}%` : "N/A";
            const itemsCount = (tx.items && tx.items.length) ? `${tx.items.length} items` : "-";

            tr.innerHTML = `
                <td><code>${tx.id}</code></td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${avatar}
                        <span>${customerName}</span>
                    </div>
                </td>
                <td>${tx.paypal_email}</td>
                <td><strong style="color:var(--color-accent-light);">$${parseFloat(tx.amount).toFixed(2)}</strong></td>
                <td>${itemsCount}</td>
                <td>${bioConf}</td>
                <td><span class="badge-status ${statusBadgeClass}">${tx.status}</span></td>
                <td>${tx.created_at}</td>
            `;
            tbody.appendChild(tr);
        });
        if (window.lucide) window.lucide.createIcons();
    }

    async loadCustomers() {
        try {
            const res = await fetch("/api/dashboard/customers");
            if (!res.ok) throw new Error("Backend API unavailable");
            const data = await res.json();
            this.renderCustomers(data.customers || []);
        } catch (e) {
            if (window.FacePalStore) {
                this.renderCustomers(window.FacePalStore.getUsers());
            }
        }
    }

    renderCustomers(users) {
        const tbody = document.getElementById("dashUsersTableBody");
        if (!tbody) return;

        tbody.innerHTML = "";
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--color-text-muted);">No faces registered in database yet.</td></tr>`;
            return;
        }

        users.forEach(u => {
            const tr = document.createElement("tr");
            const avatar = u.face_image_path ? `<img src="${u.face_image_path}" class="table-face-avatar" alt="${u.full_name}">` : `<div style="width:36px;height:36px;border-radius:50%;background:#333;display:flex;align-items:center;justify-content:center;"><i data-lucide="user"></i></div>`;
            
            tr.innerHTML = `
                <td>${avatar}</td>
                <td>#${u.id}</td>
                <td><strong>${u.full_name}</strong></td>
                <td>${u.email}</td>
                <td><span style="color:#38bdf8;">${u.paypal_email}</span></td>
                <td><strong style="color:var(--color-success);">$${parseFloat(u.paypal_balance).toFixed(2)}</strong></td>
                <td>${u.created_at}</td>
                <td>
                    <button class="btn-sm btn-secondary" onclick="window.dashboardController.topUpUser(${u.id}, '${u.paypal_email}')">
                        + Top-Up $100
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        if (window.lucide) window.lucide.createIcons();
    }

    async loadLogs() {
        try {
            const res = await fetch("/api/dashboard/logs");
            if (!res.ok) throw new Error("Backend API unavailable");
            const data = await res.json();
            this.renderLogs(data.logs || []);
        } catch (e) {
            if (window.FacePalStore) {
                this.renderLogs(window.FacePalStore.getLogs());
            }
        }
    }

    renderLogs(logs) {
        const tbody = document.getElementById("dashLogsTableBody");
        if (!tbody) return;

        tbody.innerHTML = "";
        if (logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--color-text-muted);">No security activity logs yet.</td></tr>`;
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement("tr");
            const isBlocked = log.status === "BLOCKED";
            tr.innerHTML = `
                <td>#${log.id}</td>
                <td><strong>${log.activity_type}</strong></td>
                <td>${log.details}</td>
                <td><span class="badge-status ${isBlocked ? 'blocked' : 'completed'}">${log.status}</span></td>
                <td>${log.timestamp}</td>
            `;
            tbody.appendChild(tr);
        });
        if (window.lucide) window.lucide.createIcons();
    }

    async topUpUser(userId, userEmail) {
        try {
            const res = await fetch("/api/paypal/topup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, amount: 100.0 })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    alert(`Successfully topped up $100.00! New PayPal Balance: $${data.new_balance.toFixed(2)}`);
                    this.loadCustomers();
                    this.loadStats();
                    return;
                }
            }
            throw new Error("API not reachable");
        } catch (e) {
            if (window.FacePalStore && userEmail) {
                const updated = window.FacePalStore.topUp(userEmail, 100.0);
                if (updated) {
                    alert(`Successfully topped up $100.00 in demo wallet! New PayPal Balance: $${updated.paypal_balance.toFixed(2)}`);
                    this.loadCustomers();
                    this.loadStats();
                    this.loadLogs();
                    return;
                }
            }
            alert("Error topping up balance: " + e);
        }
    }
}

window.dashboardController = new DashboardController();
