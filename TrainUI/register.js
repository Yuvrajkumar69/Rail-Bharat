const API_BASE = "https://rail-bharat-production.up.railway.app/api";

document.addEventListener("DOMContentLoaded", () => {

    const registerForm =
        document.getElementById("registerForm");

    const registerName =
        document.getElementById("registerName");

    const registerEmail =
        document.getElementById("registerEmail");

    const registerPhone =
        document.getElementById("registerPhone");

    const registerPassword =
        document.getElementById("registerPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const registerButton =
        document.getElementById("registerButton");

    const registerStatus =
        document.getElementById("registerStatus");

    const toggleRegisterPassword =
        document.getElementById(
            "toggleRegisterPassword"
        );

    const toggleConfirmPassword =
        document.getElementById(
            "toggleConfirmPassword"
        );


    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    function showStatus(message, type) {

        if (!registerStatus) {
            return;
        }

        registerStatus.textContent = message;

        registerStatus.className =
            "auth-status " + type;
    }


    // --------------------------------------------------
    // PASSWORD TOGGLE
    // --------------------------------------------------

    function setupPasswordToggle(
        button,
        input
    ) {

        if (!button || !input) {
            return;
        }

        button.addEventListener(
            "click",
            () => {

                if (input.type === "password") {

                    input.type = "text";

                    button.textContent = "🙈";

                    button.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    input.type = "password";

                    button.textContent = "👁";

                    button.setAttribute(
                        "aria-label",
                        "Show password"
                    );
                }
            }
        );
    }


    setupPasswordToggle(
        toggleRegisterPassword,
        registerPassword
    );

    setupPasswordToggle(
        toggleConfirmPassword,
        confirmPassword
    );


    // --------------------------------------------------
    // REGISTER
    // --------------------------------------------------

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const fullName =
                    registerName.value.trim();

                const email =
                    registerEmail.value
                        .trim()
                        .toLowerCase();

                const phone =
                    registerPhone.value.trim();

                const password =
                    registerPassword.value;

                const confirm =
                    confirmPassword.value;


                // --------------------------------------------------
                // FRONTEND VALIDATION
                // --------------------------------------------------

                if (!fullName) {

                    showStatus(
                        "Please enter your full name.",
                        "error"
                    );

                    registerName.focus();

                    return;
                }


                if (!email) {

                    showStatus(
                        "Please enter your email address.",
                        "error"
                    );

                    registerEmail.focus();

                    return;
                }


                if (!phone.match(
                    /^[6-9][0-9]{9}$/
                )) {

                    showStatus(
                        "Please enter a valid 10-digit Indian mobile number.",
                        "error"
                    );

                    registerPhone.focus();

                    return;
                }


                if (password.length < 8) {

                    showStatus(
                        "Password must contain at least 8 characters.",
                        "error"
                    );

                    registerPassword.focus();

                    return;
                }


                if (password !== confirm) {

                    showStatus(
                        "Passwords do not match.",
                        "error"
                    );

                    confirmPassword.focus();

                    return;
                }


                // --------------------------------------------------
                // LOADING
                // --------------------------------------------------

                registerButton.disabled = true;

                registerButton.classList.add(
                    "loading"
                );

                registerButton.innerHTML = `
                    <span>Creating account...</span>
                    <span>⟳</span>
                `;

                showStatus(
                    "Creating your Rail Bharat account...",
                    "info"
                );


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/auth/register`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    fullName: fullName,
                                    email: email,
                                    phone: phone,
                                    password: password
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Registration failed."
                        );
                    }


                    // --------------------------------------------------
                    // SUCCESS
                    // --------------------------------------------------

                    showStatus(
                        data.message ||
                        "Registration successful.",
                        "success"
                    );


                    registerButton.innerHTML = `
                        <span>Account created</span>
                        <span>✓</span>
                    `;


                    // Clear password fields.
                    registerPassword.value = "";
                    confirmPassword.value = "";


                    // --------------------------------------------------
                    // REDIRECT TO LOGIN
                    // --------------------------------------------------

                    setTimeout(() => {

                        window.location.href =
                            "login.html";

                    }, 1200);


                } catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );

                    showStatus(
                        error.message ||
                        "Unable to connect to Rail Bharat server.",
                        "error"
                    );


                    registerButton.disabled = false;

                    registerButton.classList.remove(
                        "loading"
                    );

                    registerButton.innerHTML = `
                        <span>Create Account</span>
                        <span>→</span>
                    `;
                }
            }
        );
    }

});
