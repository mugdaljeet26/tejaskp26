document.addEventListener('DOMContentLoaded', () => {
    // Shared Elements
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Password Visibility Toggle
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? 'Show' : 'Hide';
        });
    }

    // --- Signup Page Logic ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        const empIdInput = document.getElementById('employeeId');
        const regPassword = document.getElementById('regPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const strengthBar = document.getElementById('strengthBar');
        const photoInput = document.getElementById('profilePhoto');
        const photoPreview = document.getElementById('photoPreview');
        const successMsg = document.getElementById('successMsg');

        // Generate Unique Employee ID
        const generateEmpId = () => {
            const random = Math.floor(1000 + Math.random() * 9000);
            return `TSPK-${random}`;
        };
        empIdInput.value = generateEmpId();

        // Password Strength Indicator
        regPassword.addEventListener('input', (e) => {
            const val = e.target.value;
            let strength = 0;
            if (val.length > 5) strength += 25;
            if (val.match(/[A-Z]/)) strength += 25;
            if (val.match(/[0-9]/)) strength += 25;
            if (val.match(/[^A-Za-z0-9]/)) strength += 25;

            strengthBar.style.width = strength + '%';
            if (strength <= 25) strengthBar.style.background = '#ff3e3e';
            else if (strength <= 50) strengthBar.style.background = '#ffcc00';
            else if (strength <= 75) strengthBar.style.background = '#00f2ff';
            else strengthBar.style.background = '#00ff88';
        });

        // Photo Preview
        photoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });

        // Signup Form Submission
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (regPassword.value !== confirmPassword.value) {
                document.getElementById('matchError').style.display = 'block';
                return;
            }

            const userData = {
                fullName: document.getElementById('fullName').value,
                empId: empIdInput.value,
                email: document.getElementById('regEmail').value,
                phone: document.getElementById('phone').value,
                dept: document.getElementById('department').value,
                password: btoa(regPassword.value), // Simple simulated encryption (Base64)
                photo: photoPreview.querySelector('img') ? photoPreview.querySelector('img').src : null
            };

            // Store in LocalStorage
            localStorage.setItem('employee_' + userData.email, JSON.stringify(userData));
            
            successMsg.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        });
    }

    // --- Login Page Logic ---
    const loginForm = document.getElementById('loginForm');
    const loginTabs = document.querySelectorAll('.login-tab');

    if (loginTabs.length > 0) {
        loginTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                loginTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                loginForm.dataset.activeRole = tab.dataset.role;
                
                // Optional: Update UI based on role
                const welcomeText = document.querySelector('.welcome-text');
                const loginBtn = document.querySelector('#loginForm .btn-primary');
                if (tab.dataset.role === 'admin') {
                    welcomeText.textContent = 'Administrator Secure Access';
                    loginBtn.textContent = 'Login as Admin';
                } else {
                    welcomeText.textContent = 'Portal Login Access';
                    loginBtn.textContent = 'Login as Employee';
                }
            });
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const passwordRaw = document.getElementById('password').value;
            const password = btoa(passwordRaw);
            const rememberMe = document.getElementById('rememberMe').checked;
            const selectedRole = loginForm.dataset.activeRole || 'employee';



            // Admin Check
            const adminEmail = 'tejaskp@gmail.com';
            const adminPass = 'tejas@1234';

            if (selectedRole === 'admin') {
                if (email === adminEmail && passwordRaw === adminPass) {
                    const sessionData = {
                        email: adminEmail,
                        name: 'System Admin',
                        empId: 'TSPK-ADMIN',
                        role: 'admin',
                        photo: null,
                        loggedInAt: new Date().toISOString()
                    };
                    if (rememberMe) localStorage.setItem('session', JSON.stringify(sessionData));
                    else sessionStorage.setItem('session', JSON.stringify(sessionData));
                    window.location.href = 'admin.html';
                    return;
                } else {
                    document.getElementById('emailError').textContent = 'Invalid Admin credentials.';
                    document.getElementById('emailError').style.display = 'block';
                    return;
                }
            }

            // Regular Employee Check
            const storedUser = localStorage.getItem('employee_' + email);
            
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const userRole = user.role || 'employee';

                if (user.password === password) {
                    // Check role match
                    if (userRole !== selectedRole) {
                        const errorMsg = document.getElementById('emailError');
                        errorMsg.textContent = `This account is registered as ${userRole}. Please use the correct tab.`;
                        errorMsg.style.display = 'block';
                        return;
                    }

                    // Successful Login
                    const sessionData = {
                        email: user.email,
                        name: user.fullName,
                        empId: user.empId,
                        role: userRole,
                        photo: user.photo,
                        loggedInAt: new Date().toISOString()
                    };
                    
                    if (rememberMe) {
                        localStorage.setItem('session', JSON.stringify(sessionData));
                    } else {
                        sessionStorage.setItem('session', JSON.stringify(sessionData));
                    }

                    // Redirect based on role
                    if (userRole === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    document.getElementById('passwordError').style.display = 'block';
                    document.getElementById('passwordError').textContent = 'Incorrect password.';
                }
            } else {
                document.getElementById('emailError').style.display = 'block';
                document.getElementById('emailError').textContent = 'Account not found. Please register.';
            }
        });
    }

    // Fetch and check network details via start-portal API
    const verifyNetworkSecurely = () => {
        const authSSID = 'TEJASKP AI SOFTWARE_5G';

        fetch('/api/network')
            .then(res => res.json())
            .then(data => {
                const curIP = data.ip || '127.0.0.1';
                const curSSID = data.ssid || 'Disconnected';

                // Check if it matches the required Wi-Fi
                const isAuthorized = curSSID === authSSID;

                const loginNetDot = document.getElementById('loginNetDot');
                const loginNetText = document.getElementById('loginNetText');
                if (loginNetDot) {
                    loginNetDot.className = 'status-indicator-dot ' + (isAuthorized ? 'success' : 'danger');
                }
                if (loginNetText) {
                    loginNetText.textContent = `IP: ${curIP} (${curSSID})`;
                }

                const existingOverlay = document.getElementById('networkSecurityDeniedOverlay');
                if (isAuthorized) {
                    if (existingOverlay) existingOverlay.remove();
                    return;
                }

                // If not authorized, show overlay
                if (!existingOverlay) {
                    const overlay = document.createElement('div');
                    overlay.id = 'networkSecurityDeniedOverlay';
                    overlay.className = 'network-denied-overlay';
                    overlay.innerHTML = `
                        <div style="background:rgba(8,12,20,0.95);border:1px solid rgba(255,255,255,0.08);padding:3rem;border-radius:24px;max-width:550px;box-shadow:0 20px 50px rgba(0,0,0,0.5);text-align:center">
                            <span style="font-size:4rem;margin-bottom:1.5rem;display:inline-block">🛡️</span>
                            <h2 style="font-size:1.8rem;font-weight:700;margin-bottom:1rem;color:var(--error-red)">Access Denied: Security Alert</h2>
                            <p style="color:var(--text-dim);line-height:1.6;margin-bottom:1.5rem">
                                This portal is restricted. Your device is connected to an unauthorized network. Please connect to the company's private Wi-Fi.
                            </p>
                            <div style="text-align:left;background:rgba(0,0,0,0.3);padding:1rem;border-radius:12px;border:1px solid var(--glass-border);font-size:0.9rem;margin-bottom:1.5rem">
                                <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem"><span>Required Wi-Fi SSID:</span><strong style="color:var(--accent-blue)">${authSSID}</strong></div>
                                <div style="display:flex;justify-content:space-between;border-top:1px dashed rgba(255,255,255,0.1);padding-top:0.4rem;margin-top:0.4rem"><span>Your Connected Wi-Fi:</span><strong style="color:var(--error-red)" id="overlayYourSSID">${curSSID}</strong></div>
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 1rem;">
                                ⚠️ Changing simulated options is disabled. You must physically connect to the correct Wi-Fi.
                            </div>
                        </div>
                    `;
                    document.body.appendChild(overlay);
                } else {
                    const overlayYourSSID = document.getElementById('overlayYourSSID');
                    if (overlayYourSSID) overlayYourSSID.textContent = curSSID;
                }
            })
            .catch(err => {
                console.error("Network verification failed:", err);
                const existingOverlay = document.getElementById('networkSecurityDeniedOverlay');
                if (!existingOverlay) {
                    const overlay = document.createElement('div');
                    overlay.id = 'networkSecurityDeniedOverlay';
                    overlay.className = 'network-denied-overlay';
                    overlay.innerHTML = `
                        <div style="background:rgba(8,12,20,0.95);border:1px solid rgba(255,255,255,0.08);padding:3rem;border-radius:24px;max-width:550px;box-shadow:0 20px 50px rgba(0,0,0,0.5);text-align:center">
                            <span style="font-size:4rem;margin-bottom:1.5rem;display:inline-block">⚠️</span>
                            <h2 style="font-size:1.8rem;font-weight:700;margin-bottom:1rem;color:var(--error-red)">Security Connection Required</h2>
                            <p style="color:var(--text-dim);line-height:1.6;margin-bottom:1.5rem">
                                Could not verify your local network status. Please run the secure portal server using:
                            </p>
                            <code style="display:block;background:black;padding:1rem;border-radius:8px;color:#00ff00;font-family:monospace;margin-bottom:1.5rem">node start-portal.js</code>
                            <p style="color:var(--text-dim);font-size:0.85rem">
                                Access is restricted to verify correct Wi-Fi connectivity.
                            </p>
                        </div>
                    `;
                    document.body.appendChild(overlay);
                }
            });
    };

    // Run security check on load and periodically
    verifyNetworkSecurely();
    setInterval(verifyNetworkSecurely, 5000);

});
