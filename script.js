/* =====================================================
   RIDESHARE - MAIN JAVASCRIPT
   HTML + CSS + JavaScript + LocalStorage
===================================================== */

/* =====================================================
   LOCAL STORAGE HELPERS
===================================================== */

function getUsers() {
  return JSON.parse(localStorage.getItem("rideShareUsers")) || [];
}

function saveUsers(users) {
  localStorage.setItem("rideShareUsers", JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("rideShareCurrentUser"));
}

function saveCurrentUser(user) {
  localStorage.setItem("rideShareCurrentUser", JSON.stringify(user));
}

function getRides() {
  return JSON.parse(localStorage.getItem("rideShareRides")) || [];
}

function saveRides(rides) {
  localStorage.setItem("rideShareRides", JSON.stringify(rides));
}

/* =====================================================
   PAGE NAVIGATION
===================================================== */

const pages = [
  "homePage",
  "bookPage",
  "ridePage",
  "historyPage",
  "driverPage",
  "profilePage",
];

function showPage(pageName) {
  pages.forEach(function (page) {
    const pageElement = document.getElementById(page);

    if (pageElement) {
      pageElement.classList.add("hidden");
    }
  });

  const selectedPage = document.getElementById(pageName + "Page");

  if (selectedPage) {
    selectedPage.classList.remove("hidden");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  if (pageName === "history") {
    renderHistory();
  }

  if (pageName === "profile") {
    renderProfile();
  }

  if (pageName === "driver") {
    updateDriverDashboard();
  }
}

/* =====================================================
   AUTH MODAL
===================================================== */

function openAuthModal(type) {
  document.getElementById("authModal").classList.remove("hidden");

  switchAuth(type);
}

function closeAuthModal() {
  document.getElementById("authModal").classList.add("hidden");
}

function switchAuth(type) {
  const loginForm = document.getElementById("loginForm");

  const registerForm = document.getElementById("registerForm");

  if (type === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
  }
}

/* =====================================================
   REGISTER
===================================================== */

function register() {
  const name = document.getElementById("registerName").value.trim();

  const email = document.getElementById("registerEmail").value.trim();

  const password = document.getElementById("registerPassword").value;

  if (!name || !email || !password) {
    showToast("Please fill all fields.");

    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters.");

    return;
  }

  const users = getUsers();

  const existingUser = users.find(function (user) {
    return user.email.toLowerCase() === email.toLowerCase();
  });

  if (existingUser) {
    showToast("An account with this email already exists.");

    return;
  }

  const newUser = {
    id: Date.now(),

    name: name,

    email: email,

    password: password,

    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  saveUsers(users);

  saveCurrentUser(newUser);

  closeAuthModal();

  updateNavbar();

  showToast("Account created successfully!");

  document.getElementById("registerName").value = "";
  document.getElementById("registerEmail").value = "";
  document.getElementById("registerPassword").value = "";
}

/* =====================================================
   LOGIN
===================================================== */

function login() {
  const email = document.getElementById("loginEmail").value.trim();

  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showToast("Please enter email and password.");

    return;
  }

  const users = getUsers();

  const user = users.find(function (user) {
    return (
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password
    );
  });

  if (!user) {
    showToast("Invalid email or password.");

    return;
  }

  saveCurrentUser(user);

  closeAuthModal();

  updateNavbar();

  showToast("Welcome back, " + user.name + "!");

  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
}

/* =====================================================
   LOGOUT
===================================================== */

function logout() {
  localStorage.removeItem("rideShareCurrentUser");

  document.getElementById("userDropdown").classList.remove("active");

  updateNavbar();

  showPage("home");

  showToast("You have been logged out.");
}

/* =====================================================
   UPDATE NAVBAR
===================================================== */

function updateNavbar() {
  const currentUser = getCurrentUser();

  const loginBtn = document.getElementById("loginBtn");

  const registerBtn = document.getElementById("registerBtn");

  const userMenu = document.getElementById("userMenu");

  if (currentUser) {
    loginBtn.classList.add("hidden");
    registerBtn.classList.add("hidden");

    userMenu.classList.remove("hidden");

    const firstLetter = currentUser.name.charAt(0).toUpperCase();

    document.getElementById("userInitial").textContent = firstLetter;

    document.getElementById("dropdownName").textContent = currentUser.name;

    document.getElementById("dropdownEmail").textContent = currentUser.email;
  } else {
    loginBtn.classList.remove("hidden");
    registerBtn.classList.remove("hidden");

    userMenu.classList.add("hidden");
  }
}

/* =====================================================
   USER DROPDOWN
===================================================== */

function toggleUserDropdown() {
  document.getElementById("userDropdown").classList.toggle("active");
}

/* =====================================================
   QUICK BOOK
===================================================== */

function quickBook() {
  const pickup = document.getElementById("homePickup").value.trim();

  const destination = document.getElementById("homeDestination").value.trim();

  if (!pickup || !destination) {
    showToast("Please enter pickup and destination.");

    return;
  }

  document.getElementById("pickup").value = pickup;

  document.getElementById("destination").value = destination;

  showPage("book");

  calculateFare();
}

/* =====================================================
   FARE CALCULATION
===================================================== */

function calculateFare() {
  const pickup = document.getElementById("pickup").value.trim();

  const destination = document.getElementById("destination").value.trim();

  if (!pickup || !destination) {
    showToast("Please enter both locations.");

    return;
  }

  const selectedRide = document.querySelector('input[name="rideType"]:checked');

  if (!selectedRide) {
    showToast("Please select a ride type.");

    return;
  }

  const baseFare = Number(selectedRide.dataset.base);

  /*
        Since this is a frontend college project,
        we simulate distance using the length of
        the entered locations.
    */

  const simulatedDistance = Math.max(
    3,
    Math.min(20, Math.floor((pickup.length + destination.length) / 4)),
  );

  let perKm = 12;

  if (selectedRide.value === "Bike") {
    perKm = 8;
  }

  if (selectedRide.value === "Premium") {
    perKm = 18;
  }

  const distanceFare = simulatedDistance * perKm;

  const bookingFee = 10;

  const totalFare = baseFare + distanceFare + bookingFee;

  const fareCard = document.getElementById("fareCard");

  fareCard.innerHTML = `

        <div class="fare-result">

            <div class="fare-result-header">

                <div>
                    <span class="section-label">
                        ESTIMATED FARE
                    </span>

                    <h3>${selectedRide.value} Ride</h3>
                </div>

                <div class="fare-price">
                    ₹${totalFare}
                </div>

            </div>


            <div class="fare-details">

                <div class="fare-row">

                    <span>Estimated Distance</span>

                    <strong>
                        ${simulatedDistance} km
                    </strong>

                </div>


                <div class="fare-row">

                    <span>Base Fare</span>

                    <strong>
                        ₹${baseFare}
                    </strong>

                </div>


                <div class="fare-row">

                    <span>Distance Fare</span>

                    <strong>
                        ₹${distanceFare}
                    </strong>

                </div>


                <div class="fare-row">

                    <span>Booking Fee</span>

                    <strong>
                        ₹${bookingFee}
                    </strong>

                </div>

            </div>


            <button
                class="btn btn-primary full-width btn-large"
                onclick="confirmRide(
                    '${escapeQuotes(pickup)}',
                    '${escapeQuotes(destination)}',
                    '${selectedRide.value}',
                    ${simulatedDistance},
                    ${totalFare}
                )"
            >
                Confirm Ride
            </button>

        </div>
    `;
}

/* =====================================================
   ESCAPE QUOTES
===================================================== */

function escapeQuotes(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/* =====================================================
   CONFIRM RIDE
===================================================== */

function confirmRide(pickup, destination, rideType, distance, fare) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    showToast("Please login before booking a ride.");

    openAuthModal("login");

    return;
  }

  const ride = {
    id: Date.now(),

    userId: currentUser.id,

    pickup: pickup,

    destination: destination,

    rideType: rideType,

    distance: distance,

    fare: fare,

    status: "Searching",

    driver: null,

    rating: null,

    date: new Date().toISOString(),
  };

  const rides = getRides();

  rides.unshift(ride);

  saveRides(rides);

  document.getElementById("ridePickup").textContent = pickup;

  document.getElementById("rideDestination").textContent = destination;

  document.getElementById("rideFare").textContent = "₹" + fare;

  document.getElementById("driverCard").classList.add("hidden");

  document.getElementById("rideStatusIcon").textContent = "🔍";

  document.getElementById("rideStatusLabel").textContent = "SEARCHING";

  document.getElementById("rideStatusTitle").textContent =
    "Finding your driver...";

  document.getElementById("rideStatusText").textContent =
    "Please wait while we connect you with a nearby driver.";

  showPage("ride");

  /*
        Simulate driver matching after 3 seconds
    */

  setTimeout(function () {
    assignDriver(ride.id);
  }, 3000);
}

/* =====================================================
   ASSIGN DRIVER
===================================================== */

function assignDriver(rideId) {
  const rides = getRides();

  const rideIndex = rides.findIndex(function (ride) {
    return ride.id === rideId;
  });

  if (rideIndex === -1) {
    return;
  }

  const drivers = [
    {
      name: "Rahul Sharma",
      vehicle: "White Swift • DL 01 AB 1234",
      rating: "4.8",
    },

    {
      name: "Amit Kumar",
      vehicle: "Blue Dzire • DL 02 CD 5678",
      rating: "4.9",
    },

    {
      name: "Vikash Singh",
      vehicle: "Red WagonR • DL 03 EF 9012",
      rating: "4.7",
    },
  ];

  const driver = drivers[Math.floor(Math.random() * drivers.length)];

  rides[rideIndex].status = "Driver Assigned";

  rides[rideIndex].driver = driver;

  saveRides(rides);

  document.getElementById("rideStatusIcon").textContent = "🚗";

  document.getElementById("rideStatusLabel").textContent = "DRIVER FOUND";

  document.getElementById("rideStatusTitle").textContent =
    "Your driver is on the way!";

  document.getElementById("rideStatusText").textContent =
    "Your driver has accepted the ride and is heading to your pickup location.";

  document.getElementById("driverCard").classList.remove("hidden");

  document.getElementById("driverName").textContent = driver.name;

  document.getElementById("driverVehicle").textContent = driver.vehicle;

  document.querySelector(".driver-rating").textContent = "⭐ " + driver.rating;

  showToast("Driver found!");
}

/* =====================================================
   CANCEL RIDE
===================================================== */

function cancelRide() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return;
  }

  const rides = getRides();

  const activeRideIndex = rides.findIndex(function (ride) {
    return (
      ride.userId === currentUser.id &&
      (ride.status === "Searching" || ride.status === "Driver Assigned")
    );
  });

  if (activeRideIndex !== -1) {
    rides[activeRideIndex].status = "Cancelled";

    saveRides(rides);
  }

  showToast("Ride cancelled.");

  showPage("home");
}

/* =====================================================
   HISTORY
===================================================== */

function renderHistory() {
  const historyList = document.getElementById("historyList");

  const currentUser = getCurrentUser();

  if (!currentUser) {
    historyList.innerHTML = `

            <div class="empty-history">

                <div class="empty-history-icon">
                    🔐
                </div>

                <h3>Login to view your rides</h3>

                <p>
                    Your ride history will appear here.
                </p>

                <button
                    class="btn btn-primary"
                    onclick="openAuthModal('login')"
                >
                    Login
                </button>

            </div>
        `;

    return;
  }

  const rides = getRides().filter(function (ride) {
    return ride.userId === currentUser.id;
  });

  if (rides.length === 0) {
    historyList.innerHTML = `

            <div class="empty-history">

                <div class="empty-history-icon">
                    🚕
                </div>

                <h3>No rides yet</h3>

                <p>
                    Your completed rides will appear here.
                </p>

                <button
                    class="btn btn-primary"
                    onclick="showPage('book')"
                >
                    Book Your First Ride
                </button>

            </div>
        `;

    return;
  }

  historyList.innerHTML = rides
    .map(function (ride) {
      const date = new Date(ride.date);

      return `

                <div class="history-item">

                    <div class="history-route">

                        <div class="history-dots">

                            <span></span>

                            <i></i>

                            <span></span>

                        </div>


                        <div>

                            <div class="history-location">

                                <small>Pickup</small>

                                <strong>
                                    ${ride.pickup}
                                </strong>

                            </div>


                            <div class="history-location">

                                <small>Destination</small>

                                <strong>
                                    ${ride.destination}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div class="history-right">

                        <strong>
                            ₹${ride.fare}
                        </strong>

                        <span>
                            ${ride.status}
                        </span>

                        <div class="history-date">
                            ${date.toLocaleDateString()}
                        </div>

                    </div>

                </div>

            `;
    })
    .join("");
}

/* =====================================================
   PROFILE
===================================================== */

function renderProfile() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    showPage("home");

    openAuthModal("login");

    return;
  }

  document.getElementById("profileName").textContent = currentUser.name;

  document.getElementById("profileEmail").textContent = currentUser.email;

  document.getElementById("profileAvatar").textContent = currentUser.name
    .charAt(0)
    .toUpperCase();

  const rides = getRides().filter(function (ride) {
    return ride.userId === currentUser.id;
  });

  document.getElementById("profileRides").textContent = rides.length;
}

/* =====================================================
   DRIVER REGISTRATION
===================================================== */

function startDriverRegistration() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    showToast("Please login to become a driver.");

    openAuthModal("login");

    return;
  }

  showToast("Driver registration started! More features coming soon.");

  document.getElementById("driverDashboard").classList.remove("hidden");

  updateDriverDashboard();
}

/* =====================================================
   DRIVER DASHBOARD
===================================================== */

function updateDriverDashboard() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return;
  }

  const rides = getRides();

  const completedRides = rides.filter(function (ride) {
    return ride.status === "Completed";
  });

  const earnings = completedRides.reduce(function (total, ride) {
    return total + Number(ride.fare);
  }, 0);

  document.getElementById("driverRides").textContent = completedRides.length;

  document.getElementById("driverEarnings").textContent = "₹" + earnings;
}

/* =====================================================
   TOAST
===================================================== */

let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");

  const toastMessage = document.getElementById("toastMessage");

  toastMessage.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 3000);
}

/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  updateNavbar();

  showPage("home");
});

/* =====================================================
   CLOSE DROPDOWN WHEN CLICKING OUTSIDE
===================================================== */

document.addEventListener("click", function (event) {
  const userMenu = document.getElementById("userMenu");

  const dropdown = document.getElementById("userDropdown");

  if (userMenu && !userMenu.contains(event.target)) {
    dropdown.classList.remove("active");
  }
});

/* =====================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
===================================================== */

document
  .getElementById("authModal")
  .addEventListener("click", function (event) {
    if (event.target === document.getElementById("authModal")) {
      closeAuthModal();
    }
  });
