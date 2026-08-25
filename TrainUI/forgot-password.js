const API_BASE = "https://rail-bharat-production.up.railway.app/api";

document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("forgotPasswordForm");

    const email =
        document.getElementById("forgotEmail");

    const button =
        document.getElementById(
            "forgotPasswordButton"
        );

    const status =
        document.getElementById(
            "forgotPasswordStatus"
        );

    function showStatus(message, type) {

        status.textContent = message;

        status.className =
            "auth-status " + type;
    }

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const emailValue =
                email.value.trim().toLowerCase();

            if (!emailValue) {

                showStatus(
                    "Please enter your email address.",
                    "error"
                );

                email.focus();

                return;
            }

            button.disabled = true;

            button.innerHTML = `
                <span>Checking...</span>
                <span>⟳</span>
            `;

            showStatus(
                "Checking your account...",
                "info"
            );

            try {

                const response =
                    await fetch(
                        `${API_BASE}/auth/forgot-password`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: emailValue
                            })
                        }
                    );

                const data =
                    await response.json()
                        .catch(() => ({}));

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to process your request."
                    );
                }
showStatus(
    data.message ||
    "Account found. You can now reset your password.",
    "success"
);

button.innerHTML = `
    <span>Request Sent</span>
    <span>✓</span>
`;

setTimeout(() => {
    window.location.href = "reset-password.html";
}, 1000);
            } catch (error) {

                console.error(
                    "Forgot password error:",
                    error
                );

                showStatus(
                    error.message ||
                    "Unable to connect to Rail Bharat server.",
                    "error"
                );

                button.disabled = false;

                button.innerHTML = `
                    <span>Continue</span>
                    <span>→</span>
                `;

                setTimeout(() => {
                    window.location.href = "reset-password.html";
                }, 1000);
            }
        }
    );

});
