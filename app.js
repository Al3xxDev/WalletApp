const translations = {
  it: {
    appTitle: "Il mio Wallet",
    balanceLabel: "Saldo Totale",
    incomeLabel: "Entrate",
    expenseLabel: "Uscite",
    dateLabel: "Data",
    catLabel: "Categoria",
    descLabel: "Descrizione",
    descPlaceholder: "Netflix, Spesa...",
    amountLabel: "Importo",
    typeLabel: "Tipo",
    optExpense: "Uscita",
    optIncome: "Entrata",
    btnAdd: "Aggiungi",
    btnSave: "Salva Modifica",
    btnCancel: "Annulla",
    searchPlaceholder: "Cerca...",
    noTrans: "Nessuna transazione nel periodo.",
    alertMissing: "Inserisci descrizione e importo",
    confirmDelete: "Eliminare definitivamente?",
    cats: {
      food: "Cibo",
      transport: "Trasporti",
      home: "Casa",
      shopping: "Shopping",
      leisure: "Svago",
      health: "Salute",
      other: "Altro",
    },
    btnBackup: "Backup",
    btnRestore: "Ripristina",
    btnCsv: "Excel",
    btnReset: "Elimina Tutto",
    alertBackupSuccess: "Backup scaricato con successo!",
    alertRestoreSuccess: "Dati ripristinati correttamente!",
    alertError: "Errore nel file.",
    goalTitle: "Obiettivo",
    goalNameLabel: "Nome Obiettivo",
    goalTargetLabel: "Cifra da raggiungere",
    btnSaveGoal: "Salva Obiettivo",
    secOverview: "Panoramica",
    secStats: "Statistiche",
    secNew: "Nuovo Movimento",
    secHistory: "Storico",
    secData: "Dati",
    pAll: "Tutto",
    pThisMonth: "Questo Mese",
    pLastMonth: "Mese Scorso",
    p3Months: "Ultimi 3 Mesi",
    pThisYear: "Quest'Anno",
    confirmReset: "ATTENZIONE: Questo cancellerà TUTTI i dati. Sei sicuro?",
  },
  en: {
    appTitle: "My Wallet",
    balanceLabel: "Total Balance",
    incomeLabel: "Income",
    expenseLabel: "Expenses",
    dateLabel: "Date",
    catLabel: "Category",
    descLabel: "Description",
    descPlaceholder: "Groceries, Salary...",
    amountLabel: "Amount",
    typeLabel: "Type",
    optExpense: "Expense",
    optIncome: "Income",
    btnAdd: "Add Transaction",
    btnSave: "Save Changes",
    btnCancel: "Cancel",
    searchPlaceholder: "Search...",
    noTrans: "No transactions in this period.",
    alertMissing: "Enter description and amount",
    confirmDelete: "Delete permanently?",
    cats: {
      food: "Food",
      transport: "Transport",
      home: "Home",
      shopping: "Shopping",
      leisure: "Leisure",
      health: "Health",
      other: "Other",
    },
    btnBackup: "Backup",
    btnRestore: "Restore",
    btnCsv: "Excel",
    btnReset: "Reset All",
    alertBackupSuccess: "Backup downloaded!",
    alertRestoreSuccess: "Data restored successfully!",
    alertError: "Invalid file.",
    goalTitle: "Savings Goal",
    goalNameLabel: "Goal Name",
    goalTargetLabel: "Target Amount",
    btnSaveGoal: "Save Goal",
    secOverview: "Overview",
    secStats: "Statistics",
    secNew: "New Transaction",
    secHistory: "History",
    secData: "Data",
    pAll: "All Time",
    pThisMonth: "This Month",
    pLastMonth: "Last Month",
    p3Months: "Last 3 Months",
    pThisYear: "This Year",
    confirmReset: "WARNING: This will delete ALL data. Are you sure?",
  },
};

const iconEdit = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
const iconTrash = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let savingsGoal = JSON.parse(localStorage.getItem("wallet_goal")) || {
  name: "Risparmio",
  target: 1000,
};
// NUOVO: Gestione fondi manuali
let funds = JSON.parse(localStorage.getItem("wallet_funds")) || {
  bank: 0,
  cash: 0,
};

let editIndex = -1;
let currentLang = localStorage.getItem("wallet_lang") || "it";
let expenseChart = null;
let prevBalance = 0;
let prevIncome = 0;
let prevExpense = 0;

function togglePrivacy() {
  document.body.classList.toggle("privacy-active");
}
function resetAllData() {
  if (confirm(translations[currentLang].confirmReset)) {
    localStorage.clear();
    location.reload();
  }
}

// Salva i valori dei box manuali
function saveFunds() {
  const bankVal = parseFloat(document.getElementById("manual-bank").value) || 0;
  const cashVal = parseFloat(document.getElementById("manual-cash").value) || 0;
  funds = { bank: bankVal, cash: cashVal };
  localStorage.setItem("wallet_funds", JSON.stringify(funds));
  // Ricalcola il totale immediatamente
  updateDOM();
}

function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  if (start === end) {
    obj.innerText =
      (id === "income" ? "+" : id === "expense" ? "-" : "") +
      "€" +
      end.toFixed(2);
    return;
  }
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentVal = start + (end - start) * progress;
    obj.innerText =
      (id === "income" ? "+" : id === "expense" ? "-" : "") +
      "€" +
      currentVal.toFixed(2);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function toggleGoalEdit() {
  const form = document.getElementById("goal-edit-form");
  form.classList.toggle("active");
  if (form.classList.contains("active")) {
    document.getElementById("goal-name-input").value = savingsGoal.name;
    document.getElementById("goal-target-input").value = savingsGoal.target;
  }
}
function saveGoal() {
  const name = document.getElementById("goal-name-input").value;
  const target = parseFloat(document.getElementById("goal-target-input").value);
  if (name && target > 0) {
    savingsGoal = { name, target };
    localStorage.setItem("wallet_goal", JSON.stringify(savingsGoal));
    toggleGoalEdit();
    updateGoalUI(calculateCurrentBalance());
  } else {
    alert("Inserisci dati validi.");
  }
}
function updateGoalUI(currentBalance) {
  document.getElementById("goal-name-display").innerText = savingsGoal.name;
  document.getElementById("goal-current").innerText =
    "€" + currentBalance.toFixed(2);
  document.getElementById("goal-target-display").innerText =
    "€" + savingsGoal.target.toFixed(0);
  let percent = (currentBalance / savingsGoal.target) * 100;
  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;

  const goalBar = document.getElementById("goal-bar");
  if (goalBar.style.width === "" || goalBar.style.width === "0%") {
    goalBar.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        goalBar.style.width = percent + "%";
      });
    });
  } else {
    goalBar.style.width = percent + "%";
  }

  document.getElementById("goal-percent").innerText = percent.toFixed(1) + "%";
  if (percent >= 100) goalBar.classList.add("completed");
  else goalBar.classList.remove("completed");
}

function calculateCurrentBalance() {
  let total = 0;
  // Somma transazioni
  transactions.forEach((t) => {
    total += t.type === "income" ? parseFloat(t.amount) : -parseFloat(t.amount);
  });
  // Somma fondi manuali
  total += funds.bank + funds.cash;
  return total;
}

function exportData() {
  const exportObj = {
    transactions: transactions,
    goal: savingsGoal,
    funds: funds,
  }; // Include i fondi
  const dataStr = JSON.stringify(exportObj, null, 2);
  const linkElement = document.createElement("a");
  linkElement.setAttribute(
    "href",
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
  );
  linkElement.setAttribute(
    "download",
    `wallet_backup_${new Date().toISOString().slice(0, 10)}.json`
  );
  linkElement.click();
}
function exportCSV() {
  let csvContent =
    "data:text/csv;charset=utf-8,Data,Descrizione,Categoria,Tipo,Importo\n";
  transactions.forEach((t) => {
    const row = [
      t.date,
      `"${t.desc.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.amount,
    ].join(",");
    csvContent += row + "\n";
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `wallet_export_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        transactions = imported;
      } else if (imported.transactions) {
        transactions = imported.transactions;
        if (imported.goal) {
          savingsGoal = imported.goal;
          localStorage.setItem("wallet_goal", JSON.stringify(savingsGoal));
        }
        if (imported.funds) {
          funds = imported.funds;
          localStorage.setItem("wallet_funds", JSON.stringify(funds));
        }
      }
      localStorage.setItem("transactions", JSON.stringify(transactions));
      updateDOM();
      alert(translations[currentLang].alertRestoreSuccess);
    } catch (err) {
      alert(translations[currentLang].alertError);
    }
    event.target.value = "";
  };
  reader.readAsText(file);
}

function renderChart(filteredTransactions) {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const expenses = filteredTransactions.filter((t) => t.type === "expense");
  const wrapper = document.getElementById("chart-section-wrapper");
  if (expenses.length === 0) {
    wrapper.style.display = "none";
    return;
  } else {
    wrapper.style.display = "block";
  }
  const totals = {};
  expenses.forEach((t) => {
    const cat = t.category || "other";
    totals[cat] = (totals[cat] || 0) + parseFloat(t.amount);
  });
  const labels = Object.keys(totals).map(
    (k) => translations[currentLang].cats[k] || k
  );
  const data = Object.values(totals);
  const bgColors = [
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#64748b",
  ];
  if (expenseChart) {
    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = data;
    expenseChart.update();
  } else {
    expenseChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: bgColors,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "#a1a1aa",
              font: { family: "Inter", size: 11 },
              boxWidth: 10,
            },
          },
        },
        cutout: "70%",
      },
    });
  }
}

function applyLanguage() {
  const t = translations[currentLang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.innerText = t[key];
  });
  document.querySelectorAll("[data-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-placeholder");
    if (t[key]) el.placeholder = t[key];
  });
  const catSelect = document.getElementById("category");
  Array.from(catSelect.options).forEach((opt) => {
    const key = opt.value;
    if (t.cats[key])
      opt.text =
        (key === "food"
          ? "🍔 "
          : key === "transport"
          ? "🚗 "
          : key === "home"
          ? "🏠 "
          : key === "shopping"
          ? "🛍️ "
          : key === "leisure"
          ? "🎉 "
          : key === "health"
          ? "🏥 "
          : "💡 ") + t.cats[key];
  });
  document.getElementById("save-btn").innerText =
    editIndex >= 0 ? t.btnSave : t.btnAdd;
  document.getElementById("langBtn").innerText =
    currentLang === "it" ? "🇮🇹 IT" : "🇺🇸 EN";
  if (savingsGoal.name === "Risparmio" || savingsGoal.name === "Savings") {
    savingsGoal.name = currentLang === "it" ? "Risparmio" : "Savings";
  }

  // Ricarica valori fondi
  document.getElementById("manual-bank").value = funds.bank || "";
  document.getElementById("manual-cash").value = funds.cash || "";

  updateDOM();
}
function toggleLanguage() {
  currentLang = currentLang === "it" ? "en" : "it";
  localStorage.setItem("wallet_lang", currentLang);
  applyLanguage();
}

function updateDOM() {
  const list = document.getElementById("list");
  const searchQuery = document
    .getElementById("search-input")
    .value.toLowerCase();
  const period = document.getElementById("filter-period").value;
  list.innerHTML = "";
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const sorted = transactions
    .map((t, i) => ({ ...t, originalIndex: i }))
    .sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date) || b.originalIndex - a.originalIndex
    );
  const filtered = sorted.filter((t) => {
    const tDate = new Date(t.date);
    let passPeriod = true;
    if (period === "this_month") {
      passPeriod =
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear;
    } else if (period === "last_month") {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      passPeriod =
        tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
    } else if (period === "last_3_months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      passPeriod = tDate >= threeMonthsAgo;
    } else if (period === "this_year") {
      passPeriod = tDate.getFullYear() === currentYear;
    }
    const passSearch =
      t.desc.toLowerCase().includes(searchQuery) ||
      t.amount.toString().includes(searchQuery) ||
      t.date.includes(searchQuery);
    return passPeriod && passSearch;
  });

  if (filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding: 40px 20px; opacity:0.5;"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:10px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg><div style="font-size:14px;">${translations[currentLang].noTrans}</div></div>`;
  } else {
    filtered.forEach((t, idx) => {
      const val = parseFloat(t.amount);
      const isIncome = t.type === "income";
      const catName = translations[currentLang].cats[t.category || "other"];
      const li = document.createElement("li");
      li.classList.add("t-item");
      li.style.animationDelay = `${Math.min(idx * 0.05, 0.5)}s`;
      li.innerHTML = `
                <div class="t-left">
                    <span class="t-cat-badge" style="color:${
                      isIncome ? "#86efac" : "#fca5a5"
                    }">${
        isIncome ? (currentLang === "it" ? "ENTRATA" : "INCOME") : catName
      }</span>
                    <span class="t-desc">${t.desc}</span>
                    <span class="t-date">${formatDate(t.date)}</span>
                </div>
                <div class="t-right">
                    <span class="t-amount sensitive-data" style="color: ${
                      isIncome ? "var(--success-color)" : "var(--danger-color)"
                    }">
                        ${isIncome ? "+" : "-"}€${val.toFixed(2)}
                    </span>
                    <div style="display:flex; gap:2px;">
                        <button class="btn-icon" onclick="loadForEdit(${
                          t.originalIndex
                        })">${iconEdit}</button>
                        <button class="btn-icon" onclick="removeTransaction(${
                          t.originalIndex
                        })">${iconTrash}</button>
                    </div>
                </div>
            `;
      list.appendChild(li);
    });
  }
  recalcStats(filtered);
  updateGoalUI(calculateCurrentBalance());
  renderChart(filtered);
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function recalcStats(filteredList) {
  let income = 0,
    expense = 0;
  filteredList.forEach((t) => {
    const val = parseFloat(t.amount);
    if (t.type === "income") {
      income += val;
    } else {
      expense += val;
    }
  });

  // CALCOLO TOTALE: Fondi Manuali + Risultato Transazioni
  const totalBalance = calculateCurrentBalance();

  animateValue("balance", prevBalance, totalBalance, 800);
  animateValue("income", prevIncome, income, 800);
  animateValue("expense", prevExpense, expense, 800);
  prevBalance = totalBalance;
  prevIncome = income;
  prevExpense = expense;
}

function saveTransaction() {
  const dateInput = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const desc = document.getElementById("desc").value;
  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  if (!desc || !amount) {
    alert(translations[currentLang].alertMissing);
    return;
  }
  const transactionData = {
    desc,
    amount,
    type,
    category,
    date: dateInput || new Date().toISOString().split("T")[0],
  };
  if (editIndex >= 0) {
    transactions[editIndex] = transactionData;
    editIndex = -1;
  } else {
    transactions.push(transactionData);
  }
  resetForm();
  document.getElementById("search-input").value = "";
  updateDOM();
}
function loadForEdit(index) {
  const t = transactions[index];
  document.getElementById("desc").value = t.desc;
  document.getElementById("amount").value = t.amount;
  document.getElementById("type").value = t.type;
  document.getElementById("date").value = t.date;
  document.getElementById("category").value = t.category || "other";
  editIndex = index;
  document.body.classList.add("editing-mode");
  document.getElementById("cancel-btn").style.display = "block";
  document.getElementById("save-btn").innerText =
    translations[currentLang].btnSave;
  document
    .getElementById("form-card")
    .scrollIntoView({ behavior: "smooth", block: "center" });
}
function removeTransaction(index) {
  if (confirm(translations[currentLang].confirmDelete)) {
    transactions.splice(index, 1);
    if (editIndex === index) resetForm();
    updateDOM();
  }
}
function resetForm() {
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("date").valueAsDate = new Date();
  document.getElementById("type").value = "expense";
  document.getElementById("category").value = "food";
  editIndex = -1;
  document.body.classList.remove("editing-mode");
  document.getElementById("cancel-btn").style.display = "none";
  document.getElementById("save-btn").innerText =
    translations[currentLang].btnAdd;
}
function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const d = new Date(year, month - 1, day);
  const locale = currentLang === "it" ? "it-IT" : "en-US";
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
document.getElementById("date").valueAsDate = new Date();
applyLanguage();
