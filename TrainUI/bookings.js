const API_BASE = "https://rail-bharat-production.up.railway.app/api";

document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  const container = $("bookingsContainer");
  const loading = $("bookingsLoading");
  const status = $("bookingsStatus");
  const empty = $("emptyBookings");

  const totalBookings = $("totalBookings");
  const confirmedBookings = $("confirmedBookings");
  const cancelledBookings = $("cancelledBookings");
  const totalPassengers = $("totalPassengers");

  const refreshButton = $("refreshBookings");
  const menuToggle = $("menuToggle");
  const navLinks = $("navLinks");
  const authNav = $("authNav");

  // --------------------------------------------------
  // AUTH NAVBAR
  // --------------------------------------------------

  function updateAuthNavbar() {

    if (!authNav) {
      return;
    }

    const storedUser =
      localStorage.getItem("railBharatUser");

    if (!storedUser) {

      authNav.innerHTML = `
        <a
          href="login.html"
          class="auth-nav-link"
        >
          Login
        </a>

        <a
          href="register.html"
          class="auth-nav-register"
        >
          Register
        </a>
      `;

      return;
    }

    let user;

    try {

      user = JSON.parse(storedUser);

    } catch (error) {

      localStorage.removeItem(
        "railBharatUser"
      );

      window.location.href =
        "login.html";

      return;
    }

    const fullName =
      user.fullName || "User";

    authNav.innerHTML = `
      <div class="auth-user">

        <span class="auth-user-icon">
          👤
        </span>

        <span class="auth-user-name">
          ${esc(fullName)}
        </span>

      </div>

      <button
        type="button"
        class="auth-logout-btn"
        id="logoutButton"
      >
        Logout
      </button>
    `;

    const logoutButton =
      $("logoutButton");

    if (logoutButton) {

      logoutButton.addEventListener(
        "click",
        () => {

          localStorage.removeItem(
            "railBharatUser"
          );

          window.location.href =
            "index.html";
        }
      );
    }
  }

  // --------------------------------------------------
  // AUTH TOKEN
  // --------------------------------------------------

  function getAuthToken() {

    const storedUser =
      localStorage.getItem(
        "railBharatUser"
      );

    if (!storedUser) {
      return null;
    }

    try {

      const user =
        JSON.parse(storedUser);

      return user.token || null;

    } catch (error) {

      console.error(
        "Invalid authentication data:",
        error
      );

      return null;
    }
  }

  function getAuthHeaders() {

    const token =
      getAuthToken();

    if (!token) {

      throw new Error(
        "Please login to view your bookings."
      );
    }

    return {
      "Content-Type":
        "application/json",

      "Authorization":
        `Bearer ${token}`
    };
  }

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  if (menuToggle && navLinks) {

    menuToggle.addEventListener(
      "click",
      () => {
        navLinks.classList.toggle(
          "open"
        );
      }
    );

    navLinks
      .querySelectorAll("a")
      .forEach(link => {

        link.addEventListener(
          "click",
          () => {
            navLinks.classList.remove(
              "open"
            );
          }
        );

      });
  }

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  function setStatus(
    message,
    type = "error"
  ) {

    if (!status) {
      return;
    }

    status.textContent =
      message;

    status.className =
      "bookings-status " + type;

    status.style.display =
      message
        ? "block"
        : "none";
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  function setLoading(isLoading) {

    if (!loading) {
      return;
    }

    loading.style.display =
      isLoading
        ? "flex"
        : "none";

    if (refreshButton) {
      refreshButton.disabled =
        isLoading;
    }
  }

  // --------------------------------------------------
  // REMOVE BOOKINGS OLDER THAN 15 DAYS
  // --------------------------------------------------

  function filterRecentBookings(
    bookings
  ) {

    const now =
      new Date();

    const fifteenDaysAgo =
      new Date(
        now.getTime()
        -
        (15 * 24 * 60 * 60 * 1000)
      );

    return bookings.filter(
      booking => {

        if (!booking.bookingDate) {
          return true;
        }

        const bookingDate =
          new Date(
            booking.bookingDate
          );

        if (
          Number.isNaN(
            bookingDate.getTime()
          )
        ) {
          return true;
        }

        return bookingDate >=
          fifteenDaysAgo;
      }
    );
  }

  // --------------------------------------------------
  // LOAD BOOKINGS
  // --------------------------------------------------

  async function loadBookings() {

    setStatus("");
    setLoading(true);

    if (container) {
      container.innerHTML = "";
    }

    if (empty) {
      empty.style.display =
        "none";
    }

    try {

      const headers =
        getAuthHeaders();

      const response =
        await fetch(
          `${API_BASE}/bookings`,
          {
            method: "GET",
            headers: headers
          }
        );

      if (
        response.status === 401 ||
        response.status === 403
      ) {

        localStorage.removeItem(
          "railBharatUser"
        );

        window.location.href =
          "login.html";

        return;
      }

      if (!response.ok) {

        const data =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          data.message ||
          "Could not load bookings."
        );
      }

      const bookings =
        await response.json();

      if (!Array.isArray(bookings)) {

        throw new Error(
          "Invalid booking data received from backend."
        );
      }

      const recentBookings =
        filterRecentBookings(
          bookings
        );

      updateSummary(
        recentBookings
      );

      if (
        recentBookings.length === 0
      ) {

        if (empty) {
          empty.style.display =
            "block";
        }

        return;
      }

      renderBookings(
        recentBookings
      );

    } catch (error) {

      console.error(
        "My Bookings error:",
        error
      );

      setStatus(
        error.message ||
        "Could not load your bookings.",
        "error"
      );

    } finally {

      setLoading(false);
    }
  }

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  function updateSummary(
    bookings
  ) {

    const total =
      bookings.length;

    const confirmed =
      bookings.filter(
        booking =>
          String(
            booking.bookingStatus
          ).toUpperCase() ===
          "CONFIRMED"
      ).length;

    const cancelled =
      bookings.filter(
        booking =>
          String(
            booking.bookingStatus
          ).toUpperCase() ===
          "CANCELLED"
      ).length;

    const passengers =
      bookings.reduce(
        (sum, booking) =>
          sum +
          Number(
            booking.passengerCount ||
            0
          ),
        0
      );

    if (totalBookings) {
      totalBookings.textContent =
        total;
    }

    if (confirmedBookings) {
      confirmedBookings.textContent =
        confirmed;
    }

    if (cancelledBookings) {
      cancelledBookings.textContent =
        cancelled;
    }

    if (totalPassengers) {
      totalPassengers.textContent =
        passengers;
    }
  }

  // --------------------------------------------------
  // RENDER BOOKINGS
  // --------------------------------------------------

  function renderBookings(
    bookings
  ) {

    if (!container) {
      return;
    }

    container.innerHTML =
      bookings
        .map(
          booking =>
            createBookingCard(
              booking
            )
        )
        .join("");

    attachBookingActions();
  }

  // --------------------------------------------------
  // BOOKING CARD
  // --------------------------------------------------

  function createBookingCard(
    booking
  ) {

    const statusValue =
      String(
        booking.bookingStatus ||
        ""
      ).toUpperCase();

    const isConfirmed =
      statusValue ===
      "CONFIRMED";

    const isCancelled =
      statusValue ===
      "CANCELLED";

    const trainName =
      booking.trainName ||
      "Rail Bharat Train";

    const trainNumber =
      booking.trainNumber ||
      "-";

    const sourceCode =
      booking.sourceCode ||
      "-";

    const destinationCode =
      booking.destinationCode ||
      "-";

    const departure =
      fmtTime(
        booking.departureTime
      );

    const arrival =
      fmtTime(
        booking.arrivalTime
      );

    const passengerCount =
      Number(
        booking.passengerCount ||
        0
      );

    const amount =
      Number(
        booking.amount ||
        0
      );

    const statusClass =
      isConfirmed
        ? "confirmed"
        : isCancelled
          ? "cancelled"
          : "other";

    return `
      <article
        class="booking-card ${statusClass}"
        data-pnr="${esc(
          booking.pnr
        )}"
      >

        <div class="booking-card-top">

          <div class="booking-status-group">

            <span
              class="booking-status-badge ${statusClass}"
            >
              ${
                isConfirmed
                  ? "✓ CONFIRMED"
                  : isCancelled
                    ? "× CANCELLED"
                    : esc(
                        statusValue
                      )
              }
            </span>

            <span class="booking-pnr">
              PNR

              <strong>
                ${esc(
                  booking.pnr
                )}
              </strong>
            </span>

          </div>

          <div class="booking-price">

            <small>
              TOTAL FARE
            </small>

            <strong>
              ₹${amount.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>


        <div class="booking-train-info">

          <div class="train-identity">

            <div class="booking-train-icon">
              🚆
            </div>

            <div>

              <h3>
                ${esc(trainName)}
              </h3>

              <span>
                Train No. ${esc(
                  trainNumber
                )}
              </span>

            </div>

          </div>

        </div>


        <div class="booking-route">

          <div class="booking-station">

            <strong>
              ${esc(sourceCode)}
            </strong>

            <span>
              Departure
            </span>

            <b>
              ${departure}
            </b>

          </div>


          <div class="booking-route-line">

            <span>
              🚆
            </span>

          </div>


          <div class="booking-station">

            <strong>
              ${esc(
                destinationCode
              )}
            </strong>

            <span>
              Arrival
            </span>

            <b>
              ${arrival}
            </b>

          </div>

        </div>


        <div class="booking-details">

          <div class="booking-detail">

            <span>
              Passenger
            </span>

            <strong>
              ${esc(
                booking.passengerName ||
                "Passenger"
              )}
            </strong>

          </div>


          <div class="booking-detail">

            <span>
              Passengers
            </span>

            <strong>
              ${passengerCount}
            </strong>

          </div>


          <div class="booking-detail">

            <span>
              Class
            </span>

            <strong>
              ${esc(
                booking.seatClass ||
                "-"
              )}
            </strong>

          </div>


          <div class="booking-detail">

            <span>
              Payment
            </span>

            <strong>
              ${esc(
                booking.paymentStatus ||
                "-"
              )}
            </strong>

          </div>

        </div>


        <div class="booking-card-bottom">

          <button
            type="button"
            class="view-booking-btn"
            data-pnr="${esc(
              booking.pnr
            )}"
          >
            View PNR
          </button>

          ${
            isConfirmed

              ? `
                <button
                  type="button"
                  class="history-cancel-btn"
                  data-pnr="${esc(
                    booking.pnr
                  )}"
                >
                  Cancel Booking
                </button>
              `

              : `
                <span class="booking-final-state">
                  ${
                    isCancelled
                      ? "Booking cancelled"
                      : "Booking status unavailable"
                  }
                </span>
              `
          }

        </div>

      </article>
    `;
  }

  // --------------------------------------------------
  // BUTTON ACTIONS
  // --------------------------------------------------

  function attachBookingActions() {

    document
      .querySelectorAll(
        ".view-booking-btn"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const pnr =
              button.dataset.pnr;

            window.location.href =
              `index.html?pnr=${encodeURIComponent(
                pnr
              )}`;
          }
        );

      });


    document
      .querySelectorAll(
        ".history-cancel-btn"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            cancelBooking(
              button.dataset.pnr,
              button
            );

          }
        );

      });
  }

  // --------------------------------------------------
  // CANCEL BOOKING
  // --------------------------------------------------

  async function cancelBooking(
    pnr,
    button
  ) {

    if (!pnr || !button) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to cancel booking PNR ${pnr}?`
      );

    if (!confirmed) {
      return;
    }

    button.disabled =
      true;

    button.textContent =
      "Cancelling...";

    try {

      const headers =
        getAuthHeaders();

      const response =
        await fetch(
          `${API_BASE}/bookings/${encodeURIComponent(
            pnr
          )}/cancel`,
          {
            method: "PUT",
            headers: headers
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        response.status === 401 ||
        response.status === 403
      ) {

        localStorage.removeItem(
          "railBharatUser"
        );

        window.location.href =
          "login.html";

        return;
      }

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Cancellation failed."
        );
      }

      setStatus(
        `Booking ${pnr} cancelled successfully.`,
        "success"
      );

      await loadBookings();

    } catch (error) {

      console.error(
        "Cancellation error:",
        error
      );

      button.disabled =
        false;

      button.textContent =
        "Cancel Booking";

      setStatus(
        error.message ||
        "Could not cancel booking.",
        "error"
      );
    }
  }

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  if (refreshButton) {

    refreshButton.addEventListener(
      "click",
      loadBookings
    );
  }

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  function fmtTime(value) {

    if (!value) {
      return "--:--";
    }

    return String(value)
      .slice(0, 5);
  }

  function esc(value) {

    return String(value ?? "")
      .replace(
        /[&<>"']/g,
        character => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[character])
      );
  }

  // --------------------------------------------------
  // AUTH INITIALIZATION
  // --------------------------------------------------

  updateAuthNavbar();

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  loadBookings();

});
