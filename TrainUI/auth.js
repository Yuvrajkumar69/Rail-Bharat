const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    const loginEmail = document.getElementById("loginEmail");

    const loginPassword =
        document.getElementById("loginPassword");

    const loginButton =
        document.getElementById("loginButton");

    const loginStatus =
        document.getElementById("loginStatus");

    const togglePassword =
        document.getElementById("toggleLoginPassword");


    // --------------------------------------------------
    // PASSWORD VISIBILITY
    // --------------------------------------------------

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            () => {

                if (loginPassword.type === "password") {

                    loginPassword.type = "text";

                    togglePassword.textContent = "🙈";

                    togglePassword.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    loginPassword.type = "password";

                    togglePassword.textContent = "👁";

                    togglePassword.setAttribute(
                        "aria-label",
                        "Show password"
                    );
                }
            }
        );
    }


    // --------------------------------------------------
    // STATUS HELPER
    // --------------------------------------------------

    function showStatus(message, type) {

        if (!loginStatus) {
            return;
        }

        loginStatus.textContent = message;

        loginStatus.className =
            "auth-status " + type;
    }


    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                const email =
                    loginEmail.value.trim();

                const password =
                    loginPassword.value;


                if (!email) {

                    showStatus(
                        "Please enter your email address.",
                        "error"
                    );

                    loginEmail.focus();

                    return;
                }


                if (!password) {

                    showStatus(
                        "Please enter your password.",
                        "error"
                    );

                    loginPassword.focus();

                    return;
                }


                loginButton.disabled = true;

                loginButton.classList.add("loading");

                loginButton.innerHTML = `
                    <span>Signing in...</span>
                    <span>⟳</span>
                `;

                showStatus(
                    "Checking your account...",
                    "info"
                );


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/auth/login`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email,
                                    password: password
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Login failed. Please check your credentials."
                        );
                    }


                    // --------------------------------------------------
                    // SAVE LOGGED-IN USER
                    // --------------------------------------------------

                    localStorage.setItem(
                        "railBharatUser",
                        JSON.stringify(data)
                    );


                    showStatus(
                        data.message ||
                        "Login successful.",
                        "success"
                    );


                    loginButton.innerHTML = `
                        <span>Login successful</span>
                        <span>✓</span>
                    `;


                    // --------------------------------------------------
                    // REDIRECT
                    // --------------------------------------------------

                    setTimeout(() => {

                        window.location.href =
                            "index.html";

                    }, 800);


                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );

                    showStatus(
                        error.message ||
                        "Unable to connect to Rail Bharat server.",
                        "error"
                    );


                    loginButton.disabled = false;

                    loginButton.classList.remove(
                        "loading"
                    );

                    loginButton.innerHTML = `
                        <span>Sign In</span>
                        <span>→</span>
                    `;
                }
            }
        );
    }

});