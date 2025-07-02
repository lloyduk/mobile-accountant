const balanceEl = document.getElementById('balance');
const incomeEl = document.querySelectorAll('#summary div')[0];
const expenseEl = document.querySelectorAll('#summary div')[1];
const transactionList = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');

const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');

const filterCategory = document.getElementById('filter-category');
const searchInput = document.getElementById('search-input');

const warningMsg = document.getElementById('warning-msg');

let chart; 

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

filterCategory.addEventListener('change', updateUI);
searchInput.addEventListener('input', updateUI);
form.addEventListener('submit', addTransaction);

function addTransaction(e) {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!description || isNaN(amount) || !category || !date) {
    return alert('Please enter a valid description, amount, category, and date.');
  }

  transactions.push({ description, amount, category, date });
  localStorage.setItem('transactions', JSON.stringify(transactions));

  descriptionInput.value = '';
  amountInput.value = '';
  categoryInput.value = '';
  dateInput.value = '';

  updateUI();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateUI();
}

function renderChart(filtered) {
  const ctx = document.getElementById('expense-chart').getContext('2d');
  const categoryTotals = {};

  filtered.forEach(t => {
    if (t.amount < 0) {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: 'Expenses by Category',
      data: Object.values(categoryTotals),
      backgroundColor: [
        '#e74c3c', '#f39c12', '#3498db', '#9b59b6', '#2ecc71', '#34495e'
      ],
      borderWidth: 1
    }]
  };

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function updateUI() {
  transactionList.innerHTML = '';

  const selectedCategory = filterCategory.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  let income = 0;
  let expense = 0;

  const filtered = transactions.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  filtered.forEach((transaction, index) => {
    const li = document.createElement('li');
    li.classList.add(transaction.amount < 0 ? 'expense' : 'income');
    li.innerHTML = `
      <div>
        <strong>${transaction.category}</strong> - ${transaction.description}<br/>
        <small>${new Date(transaction.date).toLocaleDateString()}</small>
      </div>
      <div>
        <span>$${transaction.amount.toFixed(2)}</span>
        <button class="delete-btn" onclick="deleteTransaction(${transactions.indexOf(transaction)})">&times;</button>
      </div>
    `;
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';

    transactionList.appendChild(li);

    if (transaction.amount > 0) income += transaction.amount;
    else expense += transaction.amount;
  });

  const balance = income + expense;

  balanceEl.textContent = `Balance: $${balance.toFixed(2)}`;
  incomeEl.textContent = `Income: $${income.toFixed(2)}`;
  expenseEl.textContent = `Expenses: $${Math.abs(expense).toFixed(2)}`;

  warningMsg.style.display = balance < 0 ? 'block' : 'none';

  renderChart(filtered);
}

updateUI();