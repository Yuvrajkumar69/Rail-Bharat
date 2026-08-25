const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("resetPasswordForm");

    const email =
        document.getElementById("resetEmail");

    const newPassword =
        document.getElementById("newPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const button =
        document.getElementById(
            "resetPasswordButton"
        );

    const status =
        document.getElementById(
            "resetPasswordStatus"
        );

    const toggleNewPassword =
        document.getElementById(
            "toggleNewPassword"
        );

    const toggleConfirmPassword =
        document.getElementById(
            "toggleConfirmPassword"
        );


    // --------------------------------------------------
    // PASSWORD VISIBILITY
    // --------------------------------------------------

    function setupPasswordToggle(
        buttonElement,
        inputElement
    ) {

        if (!buttonElement || !inputElement) {
            return;
        }

        buttonElement.addEventListener(
            "click",
            () => {

                if (
                    inputElement.type ===
                    "password"
                ) {

                    inputElement.type =
                        "text";

                    buttonElement.textContent =
                        "🙈";

                    buttonElement.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    inputElement.type =
                        "password";

                    buttonElement.textContent =
                        "👁";

                    buttonElement.setAttribute(
                        "aria-label",
                        "Show password"
                    );
                }
            }
        );
    }

    setupPasswordToggle(
        toggleNewPassword,
        newPassword
    );

    setupPasswordToggle(
        toggleConfirmPassword,
        confirmPassword
    );


    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    function showStatus(
        message,
        type
    ) {

        status.textContent =
            message;

        status.className =
            "auth-status " + type;
    }


    // --------------------------------------------------
    // RESET PASSWORD
    // --------------------------------------------------

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const emailValue =
                email.value
                    .trim()
                    .toLowerCase();

            const passwordValue =
                newPassword.value;

            const confirmValue =
                confirmPassword.value;


            if (!emailValue) {

                showStatus(
                    "Please enter your email address.",
                    "error"
                );

                email.focus();

                return;
            }


            if (passwordValue.length < 8) {

                showStatus(
                    "Password must contain at least 8 characters.",
                    "error"
                );

                newPassword.focus();

                return;
            }


            if (
                passwordValue !==
                confirmValue
            ) {

                showStatus(
                    "Passwords do not match.",
                    "error"
                );

                confirmPassword.focus();

                return;
            }


            button.disabled = true;

            button.innerHTML = `
                <span>Resetting...</span>
                <span>⟳</span>
            `;

            showStatus(
                "Updating your password...",
                "info"
            );


            try {

                const response =
                    await fetch(
                        `${API_BASE}/auth/reset-password`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email:
                                        emailValue,

                                    newPassword:
                                        passwordValue
                                })
                        }
                    );


                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Password reset failed."
                    );
                }


                showStatus(
                    data.message ||
                    "Password reset successful.",
                    "success"
                );


                button.innerHTML = `
                    <span>Password Reset</span>
                    <span>✓</span>
                `;


                form.reset();


                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1500);


            } catch (error) {

                console.error(
                    "Reset password error:",
                    error
                );

                showStatus(
                    error.message ||
                    "Unable to connect to Rail Bharat server.",
                    "error"
                );

                button.disabled = false;

                button.innerHTML = `
                    <span>Reset Password</span>
                    <span>→</span>
                `;
            }

        }
    );

});