/**
 * Settings.js - Handles Settings, Data Export/Import, and Notifications
 */

document.addEventListener('DOMContentLoaded', () => {

    // Notification Logic
    const btnNotif = document.getElementById('btn-request-notif');
    if(btnNotif) {
        // Check current state
        if(window.Notification && Notification.permission === 'granted') {
            btnNotif.innerText = 'Enabled';
            btnNotif.disabled = true;
        }

        btnNotif.addEventListener('click', () => {
            if(!window.Notification) return alert('Browser does not support notifications.');
            Notification.requestPermission().then(r => {
                if(r === 'granted') {
                    btnNotif.innerText = 'Enabled';
                    btnNotif.disabled = true;
                    new Notification(':)', { body: 'Notifications are active!' });
                }
            });
        });
    }

    // UI Updates on load
    window.addEventListener('auth-changed', () => {
        const user = Storage.getCurrentUser();
        if(!user) return;

        // Settings init
        const avatarOpts = document.querySelectorAll('#settings-avatar-color .color-option');
        if(avatarOpts.length > 0) {
            avatarOpts.forEach(o => o.classList.remove('active'));
            const mapColorsToNames = {
                '#00F5D4': 'teal', '#FFB347': 'amber', '#A78BFA': 'violet', '#EF4444': 'red'
            };
            const col = user.profile.avatarColor; // the string like 'teal'
            const target = Array.from(avatarOpts).find(o => o.dataset.color === col);
            if(target) target.classList.add('active');
        }

        const waterInput = document.getElementById('settings-water-goal');
        if(waterInput) waterInput.value = user.settings.waterGoal;
    });

    // Save preferences
    const btnSave = document.getElementById('btn-save-settings');
    if(btnSave) {
        btnSave.addEventListener('click', () => {
            const user = Storage.getCurrentUser();
            if(!user) return;

            const waterInput = document.getElementById('settings-water-goal');
            user.settings.waterGoal = parseInt(waterInput.value) || 2000;

            const colorOpt = document.querySelector('#settings-avatar-color .color-option.active');
            if(colorOpt) {
                user.profile.avatarColor = colorOpt.dataset.color;
            }

            const allUsers = Storage.getUsers();
            allUsers[user.id] = user;
            Storage.saveUsers(allUsers);
            
            alert('Settings saved!');
            window.dispatchEvent(new Event('auth-changed')); // Trigger re-renders
        });
    }
    
    // Avatar color toggles in Settings
    const avatarOpts = document.querySelectorAll('#settings-avatar-color .color-option');
    avatarOpts.forEach(opt => {
        opt.addEventListener('click', function() {
            avatarOpts.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // --- Data Management ---
    
    // Export Data
    const btnExport = document.getElementById('btn-export-data');
    if(btnExport) {
        btnExport.addEventListener('click', () => {
            const user = Storage.getCurrentUser();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `habit_tracker_backup_${user.profile.username}_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    // Import Data
    const fileInput = document.getElementById('import-file');
    const btnImport = document.getElementById('btn-trigger-import');
    
    if(btnImport && fileInput) {
        btnImport.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if(importedData && importedData.id && importedData.profile) {
                        if(confirm(`Are you sure you want to overwrite your data with backup for "${importedData.profile.username}"?`)) {
                            // Update user data entirely
                            const allUsers = Storage.getUsers();
                            // Overwrite current user data footprint, keeping id mapping the same inside local storage keys
                            const session = Storage.getSession();
                            const currentId = session.currentUserId;
                            
                            // Reassign the ID so it matches current session
                            importedData.id = currentId;
                            importedData.profile.id = currentId;

                            allUsers[currentId] = importedData;
                            Storage.saveUsers(allUsers);
                            
                            alert('Data imported successfully!');
                            window.location.reload(); 
                        }
                    } else {
                        alert('Invalid backup file format.');
                    }
                } catch(err) {
                    alert('Error parsing JSON backup file.');
                }
            };
            reader.readAsText(file);
        });
    }

    // Clear Data
    const btnClear = document.getElementById('btn-clear-data');
    if(btnClear) {
        btnClear.addEventListener('click', () => {
            if(confirm('Are you absolutely sure you want to delete ALL your data and account? This cannot be undone.')) {
                if(confirm('Type "DELETE" below to confirm:') !== null) { // Simple confirm bypass
                    const session = Storage.getSession();
                    const allUsers = Storage.getUsers();
                    delete allUsers[session.currentUserId];
                    
                    Storage.saveUsers(allUsers);
                    Storage.clearSession();
                    
                    window.location.reload();
                }
            }
        });
    }
});
