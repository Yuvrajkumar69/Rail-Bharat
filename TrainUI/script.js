const API_BASE = "https://rail-bharat-production.up.railway.app/api";

document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  const form = $("search-form");
  const source = $("source");
  const destination = $("destination");
  const date = $("journeyDate");
  const results = $("results-container");
  const loading = $("loading");
  const status = $("statusMessage");
  const searchBtn = $("searchButton");
  const bookingModal = $("bookingModal");
  const pnrModal = $("pnrModal");

  let selectedSchedule = null;
  let bookedScheduleId = null;

  // --------------------------------------------------
  // INITIAL DATE
  // --------------------------------------------------

  date.min = new Date().toISOString().split("T")[0];
  date.value = date.min;

  // --------------------------------------------------
  // HERO BACKGROUND SLIDER
  // --------------------------------------------------

  const hero =
    document.querySelector(".hero");

  if (hero) {

   const heroImages = [
     "images/hero1.png",
     "images/hero2.png",
     "images/hero3.png",
     "images/hero4.png",
     "images/hero5.png"
   ];

    let heroIndex = 0;

    hero.style.backgroundImage =
      `
      linear-gradient(
        90deg,
        rgba(6, 21, 43, 0.91),
        rgba(6, 21, 43, 0.54)
      ),
      url("${heroImages[0]}")
      `;

    setInterval(() => {

      heroIndex =
        (heroIndex + 1) %
        heroImages.length;

      hero.style.backgroundImage =
        `
        linear-gradient(
          90deg,
          rgba(6, 21, 43, 0.91),
          rgba(6, 21, 43, 0.54)
        ),
        url("${heroImages[heroIndex]}")
        `;

    }, 10000);
  }

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  $("menuToggle").addEventListener("click", () => {
    $("navLinks").classList.toggle("open");
  });

  document
    .querySelectorAll(".nav-links a")
    .forEach(a => {
      a.addEventListener("click", () => {
        $("navLinks").classList.remove("open");
      });
    });

  $("swapStations").addEventListener("click", () => {
    const value = source.value;
    source.value = destination.value;
    destination.value = value;
  });

  // --------------------------------------------------
  // AUTH NAVBAR
  // --------------------------------------------------

  function updateAuthNavbar() {

    const authNav = $("authNav");

    if (!authNav) {
      return;
    }

    const storedUser =
      localStorage.getItem("railBharatUser");

    // --------------------------------------------------
    // LOGGED OUT
    // --------------------------------------------------

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

    // --------------------------------------------------
    // READ STORED USER
    // --------------------------------------------------

    let user;

    try {

      user = JSON.parse(storedUser);

    } catch (error) {

      console.error(
        "Invalid stored user:",
        error
      );

      localStorage.removeItem(
        "railBharatUser"
      );

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

    // --------------------------------------------------
    // LOGOUT
    // --------------------------------------------------

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

  // Initialize auth navbar.
  updateAuthNavbar();

  // --------------------------------------------------
  // AUTH TOKEN HELPER
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
        "Could not read login session:",
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
        "Please login before performing this action."
      );
    }

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }

  // --------------------------------------------------
  // UI HELPERS
  // --------------------------------------------------

  function setStatus(
    message,
    type = "error"
  ) {

    status.textContent = message;

    status.className =
      "status-message " + type;

    status.style.display =
      message ? "block" : "none";
  }

  function setLoading(on) {

    loading.style.display =
      on ? "flex" : "none";

    searchBtn.disabled = on;

    searchBtn.textContent =
      on
        ? "Searching..."
        : "🔍 Search";
  }
  // --------------------------------------------------
  // STATION NAME → STATION CODE
  // --------------------------------------------------

  function resolveStationCode(value) {

    const input =
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const stations = {

      "new delhi": "NDLS",
      "ndls": "NDLS",

      "old delhi": "DLI",
      "dli": "DLI",

      "ghaziabad": "GZB",
      "gzb": "GZB",

      "meerut city": "MTC",
      "meerut": "MTC",
      "mtc": "MTC",

      "moradabad": "MB",
      "mb": "MB",

      "bareilly": "BE",
      "be": "BE",

      "lucknow": "LKO",
      "lucknow junction": "LKO",
      "lko": "LKO",

      "kanpur central": "CNB",
      "kanpur": "CNB",
      "cnb": "CNB",

      "prayagraj junction": "PRYJ",
      "prayagraj": "PRYJ",
      "allahabad": "PRYJ",
      "pryj": "PRYJ",

      "varanasi junction": "BSB",
      "varanasi": "BSB",
      "banaras": "BSB",
      "bsb": "BSB",

      "agra cantt": "AGC",
      "agra": "AGC",
      "agc": "AGC",

      "mathura junction": "MTJ",
      "mathura": "MTJ",
      "mtj": "MTJ",

      "jaipur junction": "JP",
      "jaipur": "JP",
      "jp": "JP",

      "kota junction": "KOTA",
      "kota": "KOTA",
      "kota": "KOTA",

      "bhopal junction": "BPL",
      "bhopal": "BPL",
      "bpl": "BPL",

      "mumbai central": "MMCT",
      "mumbai": "MMCT",
      "mmct": "MMCT",

      "ahmedabad junction": "ADI",
      "ahmedabad": "ADI",
      "adi": "ADI",

      "surat": "ST",
      "st": "ST",

      "vadodara junction": "BRC",
      "vadodara": "BRC",
      "baroda": "BRC",
      "brc": "BRC",

      "patna junction": "PNBE",
      "patna": "PNBE",
      "pnbe": "PNBE",

      "gaya junction": "GAYA",
      "gaya": "GAYA",

      "howrah junction": "HWH",
      "howrah": "HWH",
      "hwh": "HWH",

      "kolkata sealdah": "SDAH",
      "sealdah": "SDAH",
      "kolkata": "SDAH",
      "sdah": "SDAH",

      "chennai central": "MAS",
      "chennai": "MAS",
      "mas": "MAS",

      "bengaluru city": "SBC",
      "bengaluru": "SBC",
      "bangalore": "SBC",
      "sbc": "SBC",

      "hyderabad deccan": "HYB",
      "hyderabad": "HYB",
      "hyb": "HYB",

      "pune junction": "PUNE",
      "pune": "PUNE",

      "nagpur junction": "NGP",
      "nagpur": "NGP",
      "ngp": "NGP",

      "chandigarh": "CDG",
      "cdg": "CDG",

      "amritsar junction": "ASR",
      "amritsar": "ASR",
      "asr": "ASR",

      "dehradun": "DDN",
      "ddn": "DDN",

      "haridwar junction": "HW",
      "haridwar": "HW",

      "jammu tawi": "JAT",
      "jammu": "JAT",
      "jat": "JAT",

      "ranchi": "RNC",
      "rnc": "RNC",

      "bhubaneswar": "BBS",
      "bbs": "BBS"
    };

    return stations[input] || null;
  }

  // --------------------------------------------------
  // TRAIN SEARCH
  // --------------------------------------------------

  form.addEventListener(
    "submit",
    async e => {

      e.preventDefault();

      setStatus("");

      results.innerHTML = "";

      const s =
        resolveStationCode(
          source.value
        );

      const d =
        resolveStationCode(
          destination.value
        );

      if (!s || !d) {
        return setStatus(
          "Please enter valid station names, for example New Delhi, Mumbai, Lucknow or Jaipur."
        );
      }

      if (s === d) {

        return setStatus(
          "Source and destination cannot be the same."
        );
      }

      if (!date.value) {

        return setStatus(
          "Please select a journey date."
        );
      }

      setLoading(true);

      try {

        const res =
          await fetch(
            `${API_BASE}/search/by-code?sourceCode=${encodeURIComponent(s)}&destinationCode=${encodeURIComponent(d)}`
          );

        if (!res.ok) {

          throw new Error(
            "Search request failed"
          );
        }

        const trains =
          await res.json();

        renderResults(trains);

        if (!trains.length) {

          setStatus(
            `No trains found from ${s} to ${d}. Try another route.`,
            "info"
          );
        }

      } catch (err) {

        console.error(err);

        setStatus(
          "Could not connect to Rail Bharat backend. Start Spring Boot on port 8080.",
          "error"
        );

      } finally {

        setLoading(false);
      }
    }
  );

  // --------------------------------------------------
  // RENDER TRAIN RESULTS
  // --------------------------------------------------

  function renderResults(trains) {

    results.innerHTML =
      trains.map((x, i) => {

        const t = x.train || {};
        const src = x.source || {};
        const dst = x.destination || {};

        const seats =
          x.availableSeats ?? 0;

        const fare =
          x.fare ?? 0;

        const isBooked =
          bookedScheduleId !== null &&
          Number(bookedScheduleId) ===
          Number(x.id);

        return `
          <article
            class="train-card"
            style="animation-delay:${i * 80}ms"
          >

            <div class="train-top">

              <div>

                <h3>
                  ${esc(t.trainName)}
                </h3>

                <span>
                  Train No. ${esc(t.trainNumber)}
                </span>

              </div>

              <div
                class="availability ${
                  seats < 10 ? "low" : ""
                }"
              >
                💺 ${seats} seats available
              </div>

            </div>

            <div class="route">

              <div>

                <strong>
                  ${fmtTime(x.departureTime)}
                </strong>

                <span>
                  ${esc(src.stationName)}
                </span>

                <small>
                  ${esc(src.stationCode)}
                </small>

              </div>

              <div class="route-line">
                <span>🚆</span>
              </div>

              <div>

                <strong>
                  ${fmtTime(x.arrivalTime)}
                </strong>

                <span>
                  ${esc(dst.stationName)}
                </span>

                <small>
                  ${esc(dst.stationCode)}
                </small>

              </div>

            </div>

            <div class="train-bottom">

              <div>

                <span>
                  Starting fare
                </span>

                <strong>
                  ₹${Number(fare)
                    .toLocaleString("en-IN")}
                </strong>

                / passenger

              </div>

              ${
                isBooked

                  ? `
                    <button
                      class="book-btn"
                      disabled
                    >
                      ✓ Booked
                    </button>
                  `

                  : `
                    <button
                      class="book-btn"
                      data-id="${x.id}"
                      ${seats <= 0 ? "disabled" : ""}
                    >
                      ${
                        seats <= 0
                          ? "Sold Out"
                          : "Book Now →"
                      }
                    </button>
                  `
              }

            </div>

          </article>
        `;

      }).join("");

    results
      .querySelectorAll(
        ".book-btn[data-id]"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            const schedule =
              trains.find(
                x =>
                  String(x.id) ===
                  btn.dataset.id
              );

            openBooking(schedule);
          }
        );

      });
  }

  // --------------------------------------------------
  // OPEN BOOKING MODAL
  // --------------------------------------------------

  function openBooking(schedule) {

    if (!schedule) {
      return;
    }

    selectedSchedule =
      schedule;

    $("scheduleId").value =
      schedule.id;

    const t =
      schedule.train;

    const s =
      schedule.source;

    const d =
      schedule.destination;

    $("selectedTrain").innerHTML = `
      <div>

        <strong>
          ${esc(t.trainName)}
        </strong>

        <span>
          ${esc(t.trainNumber)}
        </span>

      </div>

      <div>

        ${esc(s.stationCode)}
        →
        ${esc(d.stationCode)}

        ·

        ${fmtTime(
          schedule.departureTime
        )}

        ·

        ${schedule.availableSeats}
        seats left

      </div>
    `;

    updateAmount();

    $("bookingStatus").textContent =
      "";

    $("bookingStatus").className =
      "form-status";

    $("confirmBooking").disabled =
      false;

    $("confirmBooking").textContent =
      "Confirm & Pay →";

    bookingModal.classList.add(
      "show"
    );
  }

  // --------------------------------------------------
  // DYNAMIC PRICING
  // --------------------------------------------------

  $("passengerCount").addEventListener(
    "change",
    updateAmount
  );

  $("seatClass").addEventListener(
    "change",
    updateAmount
  );

  function getClassMultiplier(
    seatClass
  ) {

    switch (seatClass) {

      case "Sleeper":
        return 1.00;

      case "AC 3 Tier":
        return 1.40;

      case "AC 2 Tier":
        return 1.80;

      case "AC First Class":
        return 2.50;

      default:
        return 1.00;
    }
  }

  function updateAmount() {

    if (!selectedSchedule) {
      return;
    }

    const passengerCount =
      Number(
        $("passengerCount").value
      );

    const seatClass =
      $("seatClass").value;

    const baseFare =
      Number(
        selectedSchedule.fare || 0
      );

    const multiplier =
      getClassMultiplier(
        seatClass
      );

    const totalAmount =
      baseFare *
      multiplier *
      passengerCount;

    $("bookingAmount").textContent =
      "₹" +
      totalAmount.toLocaleString(
        "en-IN"
      );
  }

  // --------------------------------------------------
  // CREATE BOOKING
  // --------------------------------------------------

  // --------------------------------------------------
  // RAZORPAY PAYMENT + BOOKING
  // --------------------------------------------------

  function loadRazorpay() {
    return new Promise((resolve, reject) => {

      if (window.Razorpay) {
        resolve();
        return;
      }

      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existing) {
        existing.addEventListener(
          "load",
          () => resolve(),
          { once: true }
        );

        existing.addEventListener(
          "error",
          () => reject(
            new Error(
              "Could not load Razorpay Checkout."
            )
          ),
          { once: true }
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve();

      script.onerror = () =>
        reject(
          new Error(
            "Could not load Razorpay Checkout."
          )
        );

      document.head.appendChild(script);
    });
  }


  // --------------------------------------------------
  // CREATE RAZORPAY ORDER
  // --------------------------------------------------

  async function createRazorpayOrder(
    payload
  ) {

    const res =
      await fetch(
        `${API_BASE}/payments/create-order`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        }
      );

    const data =
      await res.json();

    if (
      res.status === 401 ||
      res.status === 403
    ) {

      localStorage.removeItem(
        "railBharatUser"
      );

      throw new Error(
        "Your login session has expired. Please login again."
      );
    }

    if (!res.ok) {

      throw new Error(
        data.message ||
        "Unable to create payment order."
      );
    }

    return data;
  }


  // --------------------------------------------------
  // VERIFY PAYMENT
  // --------------------------------------------------

  async function verifyPayment(
    paymentData
  ) {

    const res =
      await fetch(
        `${API_BASE}/payments/verify`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(paymentData)
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      throw new Error(
        data.message ||
        "Payment verification failed."
      );
    }

    if (!data.verified) {

      throw new Error(
        "Payment could not be verified."
      );
    }

    return data;
  }


  // --------------------------------------------------
  // CONFIRM BOOKING AFTER PAYMENT
  // --------------------------------------------------

  async function confirmPaidBooking(
    bookingPayload,
    paymentData
  ) {

    const res =
      await fetch(
        `${API_BASE}/bookings/confirm-payment`,
        {
          method: "POST",
          headers: getAuthHeaders(),

          body: JSON.stringify({

            booking:
              bookingPayload,

            payment:
              paymentData
          })
        }
      );

    const data =
      await res.json();

    if (
      res.status === 401 ||
      res.status === 403
    ) {

      localStorage.removeItem(
        "railBharatUser"
      );

      throw new Error(
        "Your login session has expired. Please login again."
      );
    }

    if (!res.ok) {

      throw new Error(
        data.message ||
        "Booking confirmation failed."
      );
    }

    return data;
  }


  // --------------------------------------------------
  // BOOKING FORM
  // --------------------------------------------------

  $("bookingForm").addEventListener(
    "submit",
    async e => {

      e.preventDefault();

      const btn =
        $("confirmBooking");

      btn.disabled = true;

      btn.textContent =
        "Creating payment...";


      const bookingPayload = {

        scheduleId:
          Number(
            $("scheduleId").value
          ),

        passengerName:
          $("passengerName")
            .value
            .trim(),

        passengerPhone:
          $("passengerPhone")
            .value
            .trim(),

        passengerCount:
          Number(
            $("passengerCount").value
          ),

        seatClass:
          $("seatClass").value
      };


      try {

        // Make sure user is logged in.
        getAuthHeaders();

        // Load Razorpay Checkout.
        await loadRazorpay();


        // ------------------------------------------------
        // STEP 1 — CREATE RAZORPAY ORDER
        // ------------------------------------------------

        const order =
          await createRazorpayOrder(
            bookingPayload
          );


        if (!order.orderId) {

          throw new Error(
            "Razorpay order ID was not returned by the server."
          );
        }


        // ------------------------------------------------
        // STEP 2 — OPEN RAZORPAY CHECKOUT
        // ------------------------------------------------

        const options = {

          key:
            order.keyId,

          amount:
            Math.round(
              Number(order.amount) * 100
            ),

          currency:
            order.currency || "INR",

          name:
            "Rail Bharat",

          description:
            "Railway ticket booking",

          order_id:
            order.orderId,

          prefill: {

            name:
              bookingPayload.passengerName,

            contact:
              bookingPayload.passengerPhone
          },

          theme: {

            color:
              "#0b5ed7"
          },

          modal: {

            ondismiss: () => {

              btn.disabled =
                false;

              btn.textContent =
                "Confirm & Pay →";

              $("bookingStatus")
                .className =
                "form-status error";

              $("bookingStatus")
                .textContent =
                "Payment was cancelled. Your booking was not confirmed.";
            }
          },


          // ----------------------------------------------
          // PAYMENT SUCCESS
          // ----------------------------------------------

          handler:
            async function (
              response
            ) {

              try {

                btn.disabled =
                  true;

                btn.textContent =
                  "Verifying payment...";


                $("bookingStatus")
                  .className =
                  "form-status";


                $("bookingStatus")
                  .textContent =
                  "Payment successful. Verifying...";


                // ----------------------------------------
                // STEP 3 — VERIFY PAYMENT
                // ----------------------------------------

                const paymentData = {

                  razorpayOrderId:
                    response.razorpay_order_id,

                  razorpayPaymentId:
                    response.razorpay_payment_id,

                  razorpaySignature:
                    response.razorpay_signature
                };


                await verifyPayment(
                  paymentData
                );


                $("bookingStatus")
                  .textContent =
                  "Payment verified. Confirming booking...";


                // ----------------------------------------
                // STEP 4 — CREATE BOOKING
                // ----------------------------------------

                const data =
                  await confirmPaidBooking(
                    bookingPayload,
                    paymentData
                  );


                bookedScheduleId =
                  Number(
                    selectedSchedule.id
                  );


                $("bookingStatus")
                  .className =
                  "form-status success";


                $("bookingStatus")
                  .innerHTML = `

                    <strong>
                      Booking confirmed! 🎉
                    </strong>

                    <br>

                    PNR:
                    <b>
                      ${esc(data.pnr)}
                    </b>

                    <br>

                    Payment:
                    <b>
                      ₹${Number(
                        data.amount
                      ).toLocaleString("en-IN")}
                    </b>

                    <br>

                    <small>
                      Payment verified successfully.
                    </small>
                  `;


                btn.textContent =
                  "Booked ✓";


                // Refresh train availability.
                setTimeout(() => {

                  bookingModal
                    .classList
                    .remove("show");

                  form.dispatchEvent(
                    new Event("submit")
                  );

                }, 5000);


              } catch (err) {

                console.error(
                  "Payment/booking error:",
                  err
                );


                $("bookingStatus")
                  .className =
                  "form-status error";


                $("bookingStatus")
                  .textContent =
                  err.message ||
                  "Payment verification or booking confirmation failed.";


                btn.disabled =
                  false;

                btn.textContent =
                  "Confirm & Pay →";
              }
            }
        };


        // ------------------------------------------------
        // OPEN RAZORPAY
        // ------------------------------------------------

        const razorpay =
          new Razorpay(options);


        // ------------------------------------------------
        // PAYMENT FAILED
        // ------------------------------------------------

        razorpay.on(
          "payment.failed",
          function (response) {

            console.error(
              "Razorpay payment failed:",
              response
            );


            const reason =
              response?.error?.description ||
              "Payment failed.";


            $("bookingStatus")
              .className =
              "form-status error";


            $("bookingStatus")
              .textContent =
              `${reason} Your booking was not confirmed.`;


            btn.disabled =
              false;

            btn.textContent =
              "Confirm & Pay →";
          }
        );


        razorpay.open();


      } catch (err) {

        console.error(
          "Payment initialization error:",
          err
        );


        $("bookingStatus")
          .className =
          "form-status error";


        $("bookingStatus")
          .textContent =
          err.message ||
          "Unable to start payment.";


        btn.disabled =
          false;

        btn.textContent =
          "Confirm & Pay →";
      }
    }
  );
  // --------------------------------------------------
  // CONTACT FORM
  // --------------------------------------------------

  $("contactForm").addEventListener(
    "submit",
    async e => {

      e.preventDefault();

      const f =
        e.currentTarget;

      const out =
        $("contactStatus");

      const payload =
        Object.fromEntries(
          new FormData(f)
        );

      try {

        const r =
          await fetch(
            `${API_BASE}/contact`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(
                  payload
                )
            }
          );

        const d =
          await r.json();

        if (!r.ok) {

          throw new Error(
            d.message ||
            "Could not send message"
          );
        }

        out.className =
          "form-status success";

        out.textContent =
          d.message;

        f.reset();

      } catch (err) {

        out.className =
          "form-status error";

        out.textContent =
          err.message +
          " Make sure the backend is running.";
      }
    }
  );

  // --------------------------------------------------
  // PNR MODAL
  // --------------------------------------------------

  $("openPnr").addEventListener(
    "click",
    () => {

      pnrModal.classList.add(
        "show"
      );

      $("pnrInput").focus();
    }
  );

  // --------------------------------------------------
  // PNR LOOKUP
  // --------------------------------------------------

  $("pnrForm").addEventListener(
    "submit",
    async e => {

      e.preventDefault();

      const p =
        $("pnrInput")
          .value
          .trim();

      const out =
        $("pnrResult");

      out.innerHTML =
        "<div class='pnr-loading'>Checking...</div>";

      try {

        const r =
          await fetch(
            `${API_BASE}/bookings/${encodeURIComponent(p)}`
          );

        if (r.status === 404) {

          out.innerHTML = `
            <div class="form-status error">
              PNR not found. Please check the number.
            </div>
          `;

          return;
        }

        if (!r.ok) {

          throw new Error(
            "Unable to fetch booking details."
          );
        }

        const b =
          await r.json();

        out.innerHTML = `
          <div class="pnr-card">

            <div>

              <small>
                PNR
              </small>

              <strong>
                ${esc(b.pnr)}
              </strong>

            </div>

            <span class="paid">
              ${esc(b.paymentStatus)}
            </span>

            <hr>

            <p>

              <small>
                Passenger
              </small>

              <br>

              <b>
                ${esc(
                  b.passengerName
                )}
              </b>

              ·
              ${b.passengerCount}
              passenger(s)

            </p>

            <p>

              <small>
                Train
              </small>

              <br>

              <b>
                ${esc(
                  b.trainName ||
                  "Train details unavailable"
                )}
              </b>

            </p>

            <p>

              <small>
                Train Number
              </small>

              <br>

              <b>
                ${esc(
                  b.trainNumber || "-"
                )}
              </b>

            </p>

            <p>

              <small>
                Journey
              </small>

              <br>

              <b>
                ${esc(
                  b.sourceCode || "-"
                )}
                →
                ${esc(
                  b.destinationCode || "-"
                )}
              </b>

            </p>

            <p>

              <small>
                Departure
              </small>

              <br>

              <b>
                ${fmtTime(
                  b.departureTime
                )}
              </b>

            </p>

            <p>

              <small>
                Arrival
              </small>

              <br>

              <b>
                ${fmtTime(
                  b.arrivalTime
                )}
              </b>

            </p>

            <p>

              <small>
                Class
              </small>

              <br>

              <b>
                ${esc(
                  b.seatClass
                )}
              </b>

            </p>

            <p>

              <small>
                Total
              </small>

              <br>

              <b>
                ₹${Number(
                  b.amount
                ).toLocaleString(
                  "en-IN"
                )}
              </b>

            </p>

            <p>

              <small>
                Booking Status
              </small>

              <br>

              <b>
                ${esc(
                  b.bookingStatus
                )}
              </b>

            </p>

            ${
              String(
                b.bookingStatus
              ).toUpperCase() ===
              "CONFIRMED"

                ? `
                  <button
                    type="button"
                    class="cancel-booking-btn"
                    data-pnr="${esc(b.pnr)}"
                  >
                    Cancel Booking
                  </button>
                `

                : `
                  <div
                    class="cancelled-message"
                  >
                    Booking Cancelled
                  </div>
                `
            }

          </div>
        `;

        // --------------------------------------------------
        // CANCELLATION HANDLER
        // --------------------------------------------------

        const cancelButton =
          out.querySelector(
            ".cancel-booking-btn"
          );

        if (cancelButton) {

          cancelButton.addEventListener(
            "click",
            async () => {

              const pnr =
                cancelButton.dataset.pnr;

              const confirmed =
                confirm(
                  `Are you sure you want to cancel booking PNR ${pnr}?`
                );

              if (!confirmed) {
                return;
              }

              cancelButton.disabled =
                true;

              cancelButton.textContent =
                "Cancelling...";

              try {

                const headers =
                  getAuthHeaders();

                const cancelResponse =
                  await fetch(
                    `${API_BASE}/bookings/${encodeURIComponent(pnr)}/cancel`,
                    {
                      method: "PUT",
                      headers: headers
                    }
                  );

                const cancelData =
                  await cancelResponse.json();

                if (
                  cancelResponse.status === 401 ||
                  cancelResponse.status === 403
                ) {

                  localStorage.removeItem(
                    "railBharatUser"
                  );

                  throw new Error(
                    "Your login session has expired. Please login again."
                  );
                }

                if (!cancelResponse.ok) {

                  throw new Error(
                    cancelData.message ||
                    "Cancellation failed."
                  );
                }

                // Refresh PNR details.
                $("pnrForm").dispatchEvent(
                  new Event("submit")
                );

              } catch (err) {

                console.error(err);

                cancelButton.disabled =
                  false;

                cancelButton.textContent =
                  "Cancel Booking";

                alert(
                  err.message ||
                  "Could not cancel booking."
                );
              }
            }
          );
        }

      } catch (err) {

        console.error(err);

        out.innerHTML = `
          <div class="form-status error">
            Could not connect to backend.
          </div>
        `;
      }

    }
  );

  // --------------------------------------------------
  // CLOSE MODALS
  // --------------------------------------------------

  document
    .querySelectorAll("[data-close]")
    .forEach(b => {

      b.addEventListener(
        "click",
        () => {

          $(b.dataset.close)
            .classList.remove(
              "show"
            );

        }
      );

    });

  [bookingModal, pnrModal]
    .forEach(m => {

      m.addEventListener(
        "click",
        e => {

          if (e.target === m) {

            m.classList.remove(
              "show"
            );
          }

        }
      );

    });

  // --------------------------------------------------
  // OPEN PNR FROM URL
  // --------------------------------------------------

  const urlParams =
    new URLSearchParams(
      window.location.search
    );

  const urlPnr =
    urlParams.get("pnr");

  if (urlPnr) {

    const pnrValue =
      urlPnr.trim();

    if (pnrValue) {

      pnrModal.classList.add(
        "show"
      );

      $("pnrInput").value =
        pnrValue;

      $("pnrForm").dispatchEvent(
        new Event("submit")
      );
    }
  }

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  function fmtTime(v) {

    return v
      ? String(v).slice(0, 5)
      : "--:--";
  }

  function esc(v) {

    return String(v ?? "")
      .replace(
        /[&<>"']/g,
        c => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[c])
      );
  }

});
