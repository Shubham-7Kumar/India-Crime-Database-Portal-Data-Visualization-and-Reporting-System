// No need for API_BASE_URL - we're on the same server now!

// Application State
let currentUser = null
let currentMode = "user"
let currentTab = "2023"

// Chart Options
const chartOptions = [
  {
    id: "state",
    title: "Crime by State",
    description: "Bar chart comparing crime statistics across different states",
    icon: "📊",
  },
  {
    id: "trend",
    title: "Year-wise Crime Trends",
    description: "Line chart analyzing crime patterns over multiple years",
    icon: "📈",
  },
  {
    id: "category",
    title: "Crime Categories",
    description: "Pie chart showing distribution of different crime types",
    icon: "🥧",
  },
  {
    id: "stacked",
    title: "Stacked Bar Chart",
    description: "Multi-category crime comparison across states",
    icon: "📊",
  },
  {
    id: "scatter",
    title: "Crime vs Population",
    description: "Scatter plot analyzing relationship between population and crime",
    icon: "📉",
  },
  {
    id: "timeseries",
    title: "Time Series Comparison",
    description: "Year-over-year monthly comparison of crime trends",
    icon: "📅",
  },
  {
    id: "heatmap",
    title: "District Crime Heatmap",
    description: "Monthly crime intensity across major urban districts",
    icon: "🔥",
  },
  {
    id: "map",
    title: "India Choropleth Map",
    description: "Interactive heat map showing crime distribution across Indian states",
    icon: "🗺️",
  },
]

// Dataset Data
const datasetsByYear = {
  2023: [
    {
      title: "Complete Crime Dataset 2023",
      description: "Comprehensive crime statistics across all Indian states for 2023",
      size: "2.4 MB",
      format: "CSV",
      source: "National Crime Records Bureau",
    },
    {
      title: "State-wise Crime Data 2023",
      description: "Detailed breakdown of crimes by state and category",
      size: "1.8 MB",
      format: "JSON",
      source: "Open Government Data Platform",
    },
    {
      title: "Crime Categories Analysis 2023",
      description: "Classification and distribution of crime types",
      size: "1.2 MB",
      format: "XLSX",
      source: "Ministry of Home Affairs",
    },
  ],
  2022: [
    {
      title: "Complete Crime Dataset 2022",
      description: "Comprehensive crime statistics across all Indian states for 2022",
      size: "2.3 MB",
      format: "CSV",
      source: "National Crime Records Bureau",
    },
    {
      title: "State-wise Crime Data 2022",
      description: "Detailed breakdown of crimes by state and category",
      size: "1.7 MB",
      format: "JSON",
      source: "Open Government Data Platform",
    },
    {
      title: "Crime Categories Analysis 2022",
      description: "Classification and distribution of crime types",
      size: "1.1 MB",
      format: "XLSX",
      source: "Ministry of Home Affairs",
    },
    {
      title: "Monthly Crime Trends 2022",
      description: "Month-by-month breakdown of crime statistics",
      size: "890 KB",
      format: "CSV",
      source: "Kaggle Public Datasets",
    },
  ],
  2021: [
    {
      title: "Complete Crime Dataset 2021",
      description: "Comprehensive crime statistics across all Indian states for 2021",
      size: "2.2 MB",
      format: "CSV",
      source: "National Crime Records Bureau",
    },
    {
      title: "State-wise Crime Data 2021",
      description: "Detailed breakdown of crimes by state and category",
      size: "1.6 MB",
      format: "JSON",
      source: "Open Government Data Platform",
    },
    {
      title: "Crime Categories Analysis 2021",
      description: "Classification and distribution of crime types",
      size: "1.0 MB",
      format: "XLSX",
      source: "Ministry of Home Affairs",
    },
    {
      title: "District-wise Crime Data 2021",
      description: "Granular district-level crime statistics",
      size: "3.5 MB",
      format: "CSV",
      source: "Open Government Data Platform",
    },
  ],
  historical: [
    {
      title: "Year-wise Trends (2015-2023)",
      description: "Historical crime data showing patterns over 8 years",
      size: "3.2 MB",
      format: "CSV",
      source: "Kaggle Public Datasets",
    },
    {
      title: "Decade Analysis (2010-2020)",
      description: "Long-term crime trends and statistical analysis",
      size: "4.8 MB",
      format: "CSV",
      source: "National Crime Records Bureau",
    },
    {
      title: "All States Historical Data",
      description: "Complete historical dataset for all states (2015-2023)",
      size: "6.2 MB",
      format: "JSON",
      source: "Open Government Data Platform",
    },
  ],
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  setupEventListeners()
  renderChartGrid()
  renderTabContent()
}

function setupEventListeners() {
  document.getElementById("loginBtn").addEventListener("click", openLoginModal)
  document.getElementById("logoutBtn").addEventListener("click", handleLogout)
}

// Navigation
function navigateTo(page) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"))

  if (page === "home") {
    document.getElementById("homePage").classList.add("active")
  } else if (page === "visualizations") {
    document.getElementById("visualizationsPage").classList.add("active")
    document.getElementById("chartSelection").style.display = "block"
    document.getElementById("chartView").style.display = "none"
  } else if (page === "data-download") {
    document.getElementById("dataDownloadPage").classList.add("active")
  }
}

function backToCharts() {
  document.getElementById("chartSelection").style.display = "block"
  document.getElementById("chartView").style.display = "none"
}

// Login Modal
function openLoginModal() {
  document.getElementById("loginModal").classList.add("active")
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.remove("active")
}

function setMode(mode) {
  currentMode = mode
  const userBtn = document.getElementById("userModeBtn")
  const adminBtn = document.getElementById("adminModeBtn")
  const adminFields = document.getElementById("adminFields")
  const userInfo = document.getElementById("userInfo")

  if (mode === "user") {
    userBtn.classList.add("active")
    adminBtn.classList.remove("active")
    adminFields.style.display = "none"
    userInfo.style.display = "block"
  } else {
    userBtn.classList.remove("active")
    adminBtn.classList.add("active")
    adminFields.style.display = "block"
    userInfo.style.display = "none"
  }
}

function handleLogin() {
  if (currentMode === "user") {
    currentUser = { type: "user" }
    showToast("Logged in as User", "success")
    updateAuthUI()
    closeLoginModal()
  } else {
    const adminId = document.getElementById("adminId").value
    const password = document.getElementById("password").value

    if (!adminId || !password) {
      showToast("Please enter Admin ID and Password", "error")
      return
    }

    currentUser = { type: "admin" }
    showToast("Logged in as Admin", "success")
    updateAuthUI()
    closeLoginModal()
  }
}

function handleLogout() {
  currentUser = null
  updateAuthUI()
  showToast("Logged out successfully", "success")
}

function updateAuthUI() {
  const loginBtn = document.getElementById("loginBtn")
  const logoutBtn = document.getElementById("logoutBtn")
  const userStatus = document.getElementById("userStatus")
  const userType = document.getElementById("userType")

  if (currentUser) {
    loginBtn.style.display = "none"
    logoutBtn.style.display = "block"
    userStatus.style.display = "block"
    userType.textContent = currentUser.type === "admin" ? "Admin" : "User"
  } else {
    loginBtn.style.display = "block"
    logoutBtn.style.display = "none"
    userStatus.style.display = "none"
  }
}

function loadChart(chartId) {
  document.getElementById("chartSelection").style.display = "none"
  document.getElementById("chartView").style.display = "block"

  const chartOption = chartOptions.find((c) => c.id === chartId)
  const chartTitle = chartOption ? chartOption.title : "Chart"

  document.getElementById("chartTitle").textContent = chartTitle

  const chartImage = document.getElementById("chartImage")
  const chartUrl = `/api/charts/${chartId}.png`

  console.log(`[v0] Loading chart: ${chartId}`)
  console.log(`[v0] Chart URL: ${chartUrl}`)

  // Set up error handler before setting src
  chartImage.onerror = function () {
    console.error(`[v0] Failed to load chart from: ${chartUrl}`)
    console.error(`[v0] Status: ${this.status || "unknown"}`)

    // Fetch the URL to get detailed error info
    fetch(chartUrl)
      .then((response) => {
        console.log(`[v0] Fetch response status: ${response.status}`)
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || `HTTP ${response.status}`)
          })
        }
        return response.blob()
      })
      .then((blob) => {
        console.log(`[v0] Blob received, size: ${blob.size} bytes`)
      })
      .catch((error) => {
        console.error(`[v0] Chart fetch error: ${error.message}`)
        this.parentElement.innerHTML = `
          <div style="color: #d32f2f; padding: 2rem; background: #ffebee; border-radius: 8px; border-left: 4px solid #d32f2f;">
            <p><strong>Error Loading Chart</strong></p>
            <p>Chart: ${chartId}</p>
            <p>URL: ${chartUrl}</p>
            <p>Error: ${error.message}</p>
            <p style="font-size: 0.875rem; color: #c62828; margin-top: 1rem;">Check browser console (F12) and Flask server logs for more details.</p>
          </div>
        `
      })
  }

  // Set src to trigger load
  chartImage.src = chartUrl
  chartImage.alt = chartTitle

  document.getElementById("chartView").scrollIntoView({ behavior: "smooth", block: "start" })
}

// Tabs
function switchTab(year) {
  currentTab = year
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
  event.target.classList.add("active")
  renderTabContent()
}

function renderTabContent() {
  const content = document.getElementById("tabContent")
  const datasets = datasetsByYear[currentTab] || []

  content.innerHTML = datasets
    .map(
      (dataset) => `
        <div class="dataset-card">
            <h3>${dataset.title}</h3>
            <p>${dataset.description}</p>
            <div class="dataset-info">
                <span>Size:</span>
                <span>${dataset.size}</span>
            </div>
            <div class="dataset-info">
                <span>Format:</span>
                <span>${dataset.format}</span>
            </div>
            <div class="dataset-info">
                <span>Source:</span>
                <span>${dataset.source}</span>
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="downloadDataset('${dataset.title}', '${currentTab}')">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2"/>
                    <polyline points="7 10 12 15 17 10" stroke-width="2"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke-width="2"/>
                </svg>
                Download Dataset
            </button>
        </div>
    `,
    )
    .join("")
}

function downloadDataset(title, year) {
  showToast(`Download started: ${title}`, "success")
}

// Toast Notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = `toast show ${type}`

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

// Close modal on outside click
window.onclick = (event) => {
  const modal = document.getElementById("loginModal")
  if (event.target === modal) {
    closeLoginModal()
  }
}

function renderChartGrid() {
  const grid = document.getElementById("chartGrid")
  grid.innerHTML = chartOptions
    .map(
      (option) => `
        <div class="chart-card" onclick="loadChart('${option.id}')">
            <div class="chart-card-icon">${option.icon}</div>
            <h3>${option.title}</h3>
            <p>${option.description}</p>
            <button class="btn btn-outline" style="width: 100%; margin-top: 1rem;">View Chart</button>
        </div>
    `,
    )
    .join("")
}
// Decrypted Text Animation
const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`"

function decryptText(element, finalText) {
  let iteration = 0
  const speed = 30 // milliseconds per frame
  
  const interval = setInterval(() => {
    element.textContent = finalText
      .split("")
      .map((char, index) => {
        if (char === " ") return " "
        if (index < iteration) {
          return finalText[index]
        }
        return chars[Math.floor(Math.random() * chars.length)]
      })
      .join("")
    
    if (iteration >= finalText.length) {
      clearInterval(interval)
    }
    
    iteration += 1 / 3
  }, speed)
}

// Run animation on page load
document.addEventListener("DOMContentLoaded", () => {
  const heroTitle = document.getElementById("heroTitle")
  if (heroTitle) {
    // Start animation after a brief delay
    setTimeout(() => {
      decryptText(heroTitle, "Criminal Database Portal")
    }, 300)
  }
})

// Re-run animation when returning to home page
const originalNavigateTo = navigateTo
navigateTo = function(page) {
  originalNavigateTo(page)
  
  if (page === "home") {
    const heroTitle = document.getElementById("heroTitle")
    if (heroTitle) {
      setTimeout(() => {
        decryptText(heroTitle, "Criminal Database Portal")
      }, 100)
    }
  }
}