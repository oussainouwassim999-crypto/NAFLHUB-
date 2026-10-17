const FIXED_TEAMS = ["JSK", "MCA", "USMA", "CRB", "USMH", "MCO", "NAHD", "ESS"];

// المباريات الأربعة الافتراضية
const DEFAULT_GAMES = [
    { vs: "JSK vs MCA", time: "Time: 18:00 GMT", stad: "Stad: 5 Juillet" },
    { vs: "USMA vs CRB", time: "Time: 19:30 GMT", stad: "Stad: Nelson Mandela" },
    { vs: "ESS vs MCO", time: "Time: 21:00 GMT", stad: "Stad: 8 Mai 1945" },
    { vs: "NAHD vs USMH", time: "Time: 22:00 GMT", stad: "Stad: 20 Aout" }
];

window.addEventListener("DOMContentLoaded", () => {
    const savedUser = localStorage.getItem("naflCurrentSession");
    if (savedUser) {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainApp").style.display = "block";
        loadUserData(savedUser);
    }
    loadLeagueTable();
    loadGamesCards();
});

// تسجيل الدخول لأول مرة وحفظ الحساب
function firstLogin() {
    const username = document.getElementById("robloxUser").value.trim();
    if (!username) {
        alert("يرجى كتابة اسم حسابك في روبلوكس!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("naflAllUsers") || "[]");
    let existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!existing) {
        // أول لاعب مسجل سيكون Owner تلقائياً والبقية Player
        const role = users.length === 0 ? "Owner" : "Player";
        existing = { username: username, role: role, team: "بدون فريق" };
        users.push(existing);
        localStorage.setItem("naflAllUsers", JSON.stringify(users));
    }

    localStorage.setItem("naflCurrentSession", username);
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    loadUserData(username);
}

// تبديل الصفحات بالأزرار
function switchTab(tabId, btn) {
    document.querySelectorAll(".section-content").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    
    document.getElementById(tabId).classList.add("active");
    btn.classList.add("active");
}

// عرض المباريات الاربعة
function loadGamesCards() {
    let games = JSON.parse(localStorage.getItem("naflGamesData")) || DEFAULT_GAMES;
    const container = document.getElementById("gamesContainer");
    container.innerHTML = "";

    games.forEach((g, idx) => {
        const card = document.createElement("div");
        card.className = "game-card";
        card.innerHTML = `
            <div style="font-size:12px; color:#888; margin-bottom:5px;">مباراة #${idx + 1}</div>
            <div class="match-teams">${g.vs}</div>
            <div class="match-info">🕒 ${g.time}</div>
            <div class="match-info">🏟️ ${g.stad}</div>
        `;
        container.appendChild(card);
    });
}

// تحديث بيانات المباريات من طرف Staff / Co-owner / Owner
function updateGameData() {
    const cardIndex = document.getElementById("gameCardSelect").value;
    const vsVal = document.getElementById("editVs").value.trim();
    const timeVal = document.getElementById("editTime").value.trim();
    const stadVal = document.getElementById("editStad").value.trim();

    if (!vsVal || !timeVal || !stadVal) {
        alert("يرجى ملء جميع الحقول لتحديث المباراة!");
        return;
    }

    let games = JSON.parse(localStorage.getItem("naflGamesData")) || DEFAULT_GAMES;
    games[cardIndex] = { vs: vsVal, time: timeVal, stad: stadVal };
    
    localStorage.setItem("naflGamesData", JSON.stringify(games));
    alert("تم تحديث معلومات المباراة بنجاح! ⚽");
    loadGamesCards();
}

// تحميل البروفايل وصلاحيات الإدارة
function loadUserData(username) {
    let users = JSON.parse(localStorage.getItem("naflAllUsers") || "[]");
    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return;

    document.getElementById("profileName").innerText = user.username;
    document.getElementById("profileRole").innerText = user.role;
    document.getElementById("profileTeam").innerText = user.team;

    // تفعيل لوحة التعديل فقط للـ Owner, Co-owner, Staff
    if (["Owner", "Co-owner", "Staff"].includes(user.role)) {
        document.getElementById("adminPanel").style.display = "block";
    } else {
        document.getElementById("adminPanel").style.display = "none";
    }

    loadMyInvites(user.username);
}

// عرض ترتيب الدوري
function loadLeagueTable() {
    const tbody = document.getElementById("leagueTableBody");
    tbody.innerHTML = "";

    FIXED_TEAMS.forEach((team) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${team}</b></td>
            <td>0</td>
            <td>0</td>
            <td>0</td>
            <td>0</td>
            <td style="color: #00ff87; font-weight: bold;">0</td>
        `;
        tbody.appendChild(tr);
    });
}

// متجر البحث عن اللاعبين
function searchPlayers() {
    const query = document.getElementById("searchPlayerInput").value.toLowerCase().trim();
    const resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = "";

    if (!query) return;

    let users = JSON.parse(localStorage.getItem("naflAllUsers") || "[]");
    let currentUserSession = localStorage.getItem("naflCurrentSession");
    let currentUser = users.find(u => u.username === currentUserSession);

    const matched = users.filter(u => u.username.toLowerCase().includes(query));

    matched.forEach(u => {
        const div = document.createElement("div");
        div.style.cssText = "background:#262626; padding:10px; margin:8px 0; border-radius:6px; display:flex; justify-content:space-between; align-items:center;";
        
        let actionHTML = `<span class="badge">${u.role}</span>`;
        if (currentUser && ["Owner", "Co-owner", "Team Owner"].includes(currentUser.role) && u.username !== currentUser.username) {
            actionHTML += `<button onclick="sendOffer('${u.username}')" style="padding:5px 10px; background:#00ff87; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">إرسال عرض 📩</button>`;
        }

        div.innerHTML = `<div><b>${u.username}</b> <small style="color:#aaa;">(${u.team})</small></div> <div>${actionHTML}</div>`;
        resultsDiv.appendChild(div);
    });
}

// إرسال العروض
function sendOffer(targetUser) {
    let users = JSON.parse(localStorage.getItem("naflAllUsers") || "[]");
    let currentUserSession = localStorage.getItem("naflCurrentSession");
    let sender = users.find(u => u.username === currentUserSession);

    let offers = JSON.parse(localStorage.getItem("naflOffers") || "[]");
    offers.push({ to: targetUser, fromTeam: sender.team || "فريق رسمي", status: "pending" });
    localStorage.setItem("naflOffers", JSON.stringify(offers));
    alert("تم إرسال العرض بنجاح إلى " + targetUser);
}

// العروض الواردة
function loadMyInvites(username) {
    let offers = JSON.parse(localStorage.getItem("naflOffers") || "[]");
    let myOffers = offers.filter(o => o.to === username && o.status === "pending");
    const container = document.getElementById("myInvites");

    if (myOffers.length === 0) {
        container.innerHTML = "<p style='color: #888;'>لا توجد عروض حالياً.</p>";
        return;
    }

    container.innerHTML = "";
    myOffers.forEach((offer, index) => {
        const box = document.createElement("div");
        box.style.cssText = "background:#2b2b2b; padding:8px; margin:5px 0; border-radius:4px;";
        box.innerHTML = `
            عرض للانضمام إلى فريق: <b>${offer.fromTeam}</b><br>
            <button onclick="respondOffer(${index}, 'accepted', '${offer.fromTeam}')" style="background:#00ff87; border:none; padding:4px 10px; font-weight:bold; cursor:pointer;">قبول ✅</button>
            <button onclick="respondOffer(${index}, 'rejected', '')" style="background:#ff4444; color:#fff; border:none; padding:4px 10px; cursor:pointer;">رفض ❌</button>
        `;
        container.appendChild(box);
    });
}

function respondOffer(index, status, teamName) {
    let offers = JSON.parse(localStorage.getItem("naflOffers") || "[]");
    offers[index].status = status;
    localStorage.setItem("naflOffers", JSON.stringify(offers));

    if (status === 'accepted') {
        let currentUserSession = localStorage.getItem("naflCurrentSession");
        let users = JSON.parse(localStorage.getItem("naflAllUsers") || "[]");
        let user = users.find(u => u.username === currentUserSession);
        if (user) {
            user.team = teamName;
            localStorage.setItem("naflAllUsers", JSON.stringify(users));
            alert("مبروك! انضممت إلى فريق " + teamName);
            loadUserData(user.username);
        }
    } else {
        alert("تم رفض العرض.");
    }
}

// تعديل رولات المستخدمين
function updateUserRole() {
    const target = document.getElementById("targetUser").value.trim();
    const newRole = document.getElementById("newRoleSelect").value;

    let users = JSON.parse(localStorage.getItem("naflAllUsers") || "[]");
    let targetUserObj = users.find(u => u.username.toLowerCase() === target.toLowerCase());

    if (!targetUserObj) {
        alert("لم يتم العثور على هذا المستخدم مسجلاً في النظام!");
        return;
    }

    targetUserObj.role = newRole;
    localStorage.setItem("naflAllUsers", JSON.stringify(users));
    alert(`تم بنجاح تغيير رول اللاعب ${targetUserObj.username} إلى ${newRole}`);
}