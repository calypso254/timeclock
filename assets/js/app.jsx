function App() {
            // Updated API URL to your current endpoint
            const scriptUrl = "https://script.google.com/macros/s/AKfycbyQipNZW0DC8R0Etm_-giUXx-5pSt1bZTrUjikY7kgxmRyminft4xAiVNBpdHBb_NxgpA/exec";
            const employeeFetchErrorMessage = "Could not load employees. Please check the Google Sheet setup.";

            const [currentTime, setCurrentTime] = useState(new Date());
            const [viewMode, setViewMode] = useState('PINPAD'); 
            const [pinInput, setPinInput] = useState("");
            const [selectedId, setSelectedId] = useState(null);
            const [isAuthenticated, setIsAuthenticated] = useState(false);
            const [editTarget, setEditTarget] = useState(null);
            const [editForm, setEditForm] = useState({
                timeIn: '',
                timeInPeriod: '',
                timeOut: '',
                timeOutPeriod: '',
                oldReason: '',
                newReason: ''
            });
            const [employeeTimeOffDraft, setEmployeeTimeOffDraft] = useState(null);
            const [directoryMode, setDirectoryMode] = useState('employee');
            const [adminUser, setAdminUser] = useState(null);
            const [adminWeekStart, setAdminWeekStart] = useState(getWeekStartDate(new Date()));
            const [adminScheduleDrafts, setAdminScheduleDrafts] = useState({});
            const [selectedAdminCell, setSelectedAdminCell] = useState(null);
            const [adminTemplateName, setAdminTemplateName] = useState('');
            const [adminTemplateDraft, setAdminTemplateDraft] = useState(buildEmptyAdminTemplateDraft());
            
            // Timeout Logic States
            const lastActivityRef = useRef(Date.now());
            const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
            const [hasAcknowledgedTimeoutWarning, setHasAcknowledgedTimeoutWarning] = useState(false);
            const INITIAL_IDLE_LIMIT = 30 * 1000; // keep the short first check
            const ADMIN_IDLE_LIMIT = 60 * 60 * 1000; // 1 hour after confirming
            const EMPLOYEE_IDLE_LIMIT = 15 * 60 * 1000; // 15 minutes after confirming
            const WARNING_TIME = 15000; // 15 seconds warning countdown
            
            // Loading State
            const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
            const [isFetchingLogs, setIsFetchingLogs] = useState(false);
            const [isFetchingInventory, setIsFetchingInventory] = useState(false);
            const [isFetchingMessages, setIsFetchingMessages] = useState(false);
            const [isFetchingPenHospital, setIsFetchingPenHospital] = useState(false);
            const [isSubmittingAction, setIsSubmittingAction] = useState(false);
            const [isSubmittingInventory, setIsSubmittingInventory] = useState(false);
            const [isSubmittingAdminSchedule, setIsSubmittingAdminSchedule] = useState(false);
            const [isSavingShiftTemplates, setIsSavingShiftTemplates] = useState(false);
            const [isSubmittingTimeOff, setIsSubmittingTimeOff] = useState(false);
            const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
            const [isSubmittingPenHospital, setIsSubmittingPenHospital] = useState(false);
            const [reactingMessageRowNumber, setReactingMessageRowNumber] = useState(null);
            const [fetchError, setFetchError] = useState(null);

            // Dynamic Data State
            const [employees, setEmployees] = useState([]);
            const [sheetData, setSheetData] = useState([]);
            const [inventoryRows, setInventoryRows] = useState([]);
            const [messages, setMessages] = useState([]);
            const [penHospitalCases, setPenHospitalCases] = useState([]);
            const [messageDraft, setMessageDraft] = useState('');

            const activeIdleLimit = !isAuthenticated
                ? null
                : (hasAcknowledgedTimeoutWarning
                    ? (adminUser ? ADMIN_IDLE_LIMIT : EMPLOYEE_IDLE_LIMIT)
                    : INITIAL_IDLE_LIMIT);
            const timeoutCountdownSeconds = activeIdleLimit === null
                ? 0
                : Math.max(0, Math.ceil((activeIdleLimit + WARNING_TIME - (currentTime.getTime() - lastActivityRef.current)) / 1000));
            const timeoutResetLabel = adminUser ? '1 hour' : '15 minutes';

            const clearSessionTimeoutState = () => {
                lastActivityRef.current = Date.now();
                setShowTimeoutWarning(false);
                setHasAcknowledgedTimeoutWarning(false);
            };

            const acknowledgeTimeoutWarning = () => {
                lastActivityRef.current = Date.now();
                setShowTimeoutWarning(false);
                setHasAcknowledgedTimeoutWarning(true);
            };
            
            // Settings State (Branding)
            const [settings, setSettings] = useState({
                companyName: "",
                logoUrl: "",
                shiftTemplates: [],
            });

            const [notification, setNotification] = useState(null);
            const [reasonValidationTriggered, setReasonValidationTriggered] = useState(false);

            const buildApiUrl = (type) => `${scriptUrl}?type=${encodeURIComponent(type)}&_=${Date.now()}`;

            const refreshEmployees = async () => {
                const response = await fetch(buildApiUrl('employees'), { cache: 'no-store' });
                if (!response.ok) throw new Error('Failed to fetch employees');
                const data = await response.json();
                const formattedEmployees = data.map(emp => ({ ...emp, isClockedIn: false }));
                setEmployees(formattedEmployees);
                setFetchError(null);
                return formattedEmployees;
            };

            const refreshSettings = async () => {
                try {
                    const response = await fetch(buildApiUrl('settings'), { cache: 'no-store' });
                    if (!response.ok) return null;
                    const data = await response.json();
                    const nextSettings = {
                        companyName: (data.companyName || "").trim(),
                        logoUrl: data.logoUrl || "",
                        shiftTemplates: normalizeAdminShiftTemplates(data.shiftTemplates),
                    };
                    setSettings(nextSettings);
                    return nextSettings;
                } catch (error) {
                    console.error("Error fetching settings:", error);
                    return null;
                }
            };

            const refreshLogs = async ({ showSpinner = true } = {}) => {
                if (showSpinner) setIsFetchingLogs(true);
                try {
                    const response = await fetch(buildApiUrl('logs'), { cache: 'no-store' });
                    if (!response.ok) throw new Error('Failed to fetch timesheet rows');
                    const logData = await response.json();
                    const rows = Array.isArray(logData) ? logData.reverse() : [];
                    setSheetData(rows);
                    return rows;
                } catch (error) {
                    console.error("Error refreshing logs:", error);
                    return null;
                } finally {
                    if (showSpinner) setIsFetchingLogs(false);
                }
            };

            const refreshInventory = async ({ showSpinner = true } = {}) => {
                if (showSpinner) setIsFetchingInventory(true);
                try {
                    const response = await fetch(buildApiUrl('inventory'), { cache: 'no-store' });
                    if (!response.ok) throw new Error('Failed to fetch inventory rows');
                    const inventoryData = await response.json();
                    const rows = sortInventoryRows(Array.isArray(inventoryData) ? inventoryData : []);
                    setInventoryRows(rows);
                    return rows;
                } catch (error) {
                    console.error("Error refreshing inventory:", error);
                    return null;
                } finally {
                    if (showSpinner) setIsFetchingInventory(false);
                }
            };

            const refreshMessages = async ({ showSpinner = true } = {}) => {
                if (showSpinner) setIsFetchingMessages(true);
                try {
                    const response = await fetch(buildApiUrl('messages'), { cache: 'no-store' });
                    if (!response.ok) throw new Error('Failed to fetch messages');
                    const messageData = await response.json();
                    const rows = Array.isArray(messageData) ? messageData : [];
                    if (isLikelyLegacyMessageResponse(rows)) {
                        throw new Error("The deployed Apps Script is still the older version and does not support messages yet. Redeploy the latest Apps Script web app and try again.");
                    }
                    setMessages(rows);
                    return rows;
                } catch (error) {
                    console.error("Error refreshing messages:", error);
                    return null;
                } finally {
                    if (showSpinner) setIsFetchingMessages(false);
                }
            };

            const refreshPenHospital = async ({ showSpinner = true } = {}) => {
                if (showSpinner) setIsFetchingPenHospital(true);
                try {
                    const response = await fetch(buildApiUrl('pen_hospital'), { cache: 'no-store' });
                    if (!response.ok) throw new Error('Failed to fetch Pen Hospital rows');
                    const penHospitalData = await response.json();
                    const rows = sortPenHospitalCases(Array.isArray(penHospitalData) ? penHospitalData : []);
                    setPenHospitalCases(rows);
                    return rows;
                } catch (error) {
                    console.error("Error refreshing Pen Hospital:", error);
                    return null;
                } finally {
                    if (showSpinner) setIsFetchingPenHospital(false);
                }
            };

            const refreshSheetData = async (showToast = false, { showSpinner = true, isInitialLoad = false } = {}) => {
                const hadEmployees = employees.length > 0;
                if (showSpinner) setIsFetchingLogs(true);
                if (showSpinner) setIsFetchingInventory(true);
                if (showSpinner) setIsFetchingMessages(true);
                if (showSpinner) setIsFetchingPenHospital(true);

                let rows = null;
                let inventory = null;
                let messageRows = null;
                let penHospital = null;
                try {
                    const [employeesResult, settingsResult, logsResult, inventoryResult, messagesResult, penHospitalResult] = await Promise.allSettled([
                        refreshEmployees(),
                        refreshSettings(),
                        refreshLogs({ showSpinner: false }),
                        refreshInventory({ showSpinner: false }),
                        refreshMessages({ showSpinner: false }),
                        refreshPenHospital({ showSpinner: false }),
                    ]);

                    if (employeesResult.status === 'rejected') {
                        console.error("Error fetching employees:", employeesResult.reason);
                        if (!hadEmployees) {
                            setFetchError(employeeFetchErrorMessage);
                        }
                    }

                    if (settingsResult.status === 'rejected') {
                        console.error("Error refreshing settings:", settingsResult.reason);
                    }

                    if (messagesResult.status === 'rejected') {
                        console.error("Error refreshing messages:", messagesResult.reason);
                    }

                    if (penHospitalResult.status === 'rejected') {
                        console.error("Error refreshing Pen Hospital:", penHospitalResult.reason);
                    }

                    rows = logsResult.status === 'fulfilled' ? logsResult.value : null;
                    inventory = inventoryResult.status === 'fulfilled' ? inventoryResult.value : null;
                    messageRows = messagesResult.status === 'fulfilled' ? messagesResult.value : null;
                    penHospital = penHospitalResult.status === 'fulfilled' ? penHospitalResult.value : null;
                } finally {
                    if (showSpinner) setIsFetchingLogs(false);
                    if (showSpinner) setIsFetchingInventory(false);
                    if (showSpinner) setIsFetchingMessages(false);
                    if (showSpinner) setIsFetchingPenHospital(false);
                    if (isInitialLoad) setIsLoadingEmployees(false);
                }

                if (showToast) {
                    setNotification((rows || inventory || messageRows || penHospital)
                        ? { type: 'info', message: "Latest spreadsheet updates loaded" }
                        : { type: 'error', message: "Could not pull the latest spreadsheet updates." }
                    );
                }
                return { rows, inventory, messages: messageRows, penHospital };
            };

            const getBaseAdminScheduleDraft = (employeeName, dateValue, rows = sheetData) => {
                const sourceRow = getScheduleRowForEmployeeDate(rows, employeeName, dateValue);
                return sourceRow
                    ? buildAdminScheduleDraftFromRow(sourceRow, employeeName, dateValue)
                    : buildEmptyAdminScheduleForm(employeeName, dateValue);
            };

            const getAdminScheduleDraft = (employeeName, dateValue, draftMap = adminScheduleDrafts, rows = sheetData) => {
                const draftKey = buildScheduleCellKey(employeeName, dateValue);
                return draftMap[draftKey] || getBaseAdminScheduleDraft(employeeName, dateValue, rows);
            };

            const updateAdminScheduleDraft = (employeeName, dateValue, patch) => {
                const normalizedDate = normalizeDate(dateValue);
                setAdminScheduleDrafts(prev => {
                    const draftKey = buildScheduleCellKey(employeeName, normalizedDate);
                    const baseDraft = getBaseAdminScheduleDraft(employeeName, normalizedDate);
                    const currentDraft = prev[draftKey] || baseDraft;
                    const nextDraft = typeof patch === 'function'
                        ? patch(currentDraft)
                        : { ...currentDraft, ...patch };
                    const normalizedDraft = {
                        ...nextDraft,
                        name: employeeName,
                        date: normalizedDate,
                        sourceRow: nextDraft?.sourceRow === undefined ? (currentDraft.sourceRow || baseDraft.sourceRow || null) : nextDraft.sourceRow,
                    };

                    if (areAdminScheduleDraftsEquivalent(normalizedDraft, baseDraft)) {
                        const { [draftKey]: _removed, ...rest } = prev;
                        return rest;
                    }

                    return {
                        ...prev,
                        [draftKey]: normalizedDraft,
                    };
                });
            };

            const applyTemplateToAdminSchedule = (employeeName, dateValue, templateId) => {
                const template = getVisibleAdminShiftTemplates(settings.shiftTemplates).find(item => item.id === templateId);
                if (!template) return;

                updateAdminScheduleDraft(employeeName, dateValue, currentDraft => {
                    if (template.clearSchedule) {
                        return {
                            ...currentDraft,
                            schedIn: '',
                            schedInPeriod: 'AM',
                            schedOut: '',
                            schedOutPeriod: 'PM',
                            scheduleStatus: '',
                            clearSchedule: true,
                        };
                    }

                    const parsedIn = parseTimeField(template.schedIn);
                    const parsedOut = parseTimeField(template.schedOut);
                    return {
                        ...currentDraft,
                        schedIn: parsedIn.time,
                        schedInPeriod: parsedIn.period || 'AM',
                        schedOut: parsedOut.time,
                        schedOutPeriod: parsedOut.period || 'PM',
                        scheduleStatus: normalizeAdminScheduleStatus(template.scheduleStatus),
                        clearSchedule: false,
                    };
                });
            };

            const selectAdminCell = (employeeName, dateValue) => {
                setSelectedAdminCell({
                    name: employeeName,
                    date: normalizeDate(dateValue),
                });
            };

            const jumpToAdminWeek = (dateValue) => {
                if (!dateValue) return;
                setAdminWeekStart(getWeekStartDate(dateValue));
                setSelectedAdminCell(null);
                setViewMode('ADMIN');
            };

            const persistAdminShiftTemplates = async (nextTemplates, successMessage) => {
                if (!adminUser || !isAdminRole(adminUser.role) || isSavingShiftTemplates) return false;

                setIsSavingShiftTemplates(true);
                try {
                    const payloadTemplates = normalizeAdminShiftTemplates(nextTemplates).map(template => ({
                        id: template.id,
                        label: template.label,
                        schedIn: template.schedIn,
                        schedOut: template.schedOut,
                        scheduleStatus: normalizeAdminScheduleStatus(template.scheduleStatus),
                    }));

                    const result = await sendToSheet({
                        action: "SAVE_SHIFT_TEMPLATES",
                        editorName: adminUser.name,
                        editorRole: adminUser.role || 'admin',
                        shiftTemplates: payloadTemplates,
                    });

                    if (!result.ok) {
                        setNotification({ type: 'error', message: result.error || "Could not save the shift templates." });
                        return false;
                    }

                    const savedTemplates = normalizeAdminShiftTemplates(result?.parsed?.shiftTemplates || payloadTemplates);
                    setSettings(prev => ({
                        ...prev,
                        shiftTemplates: savedTemplates,
                    }));
                    setNotification({ type: 'success', message: successMessage });
                    return true;
                } catch (err) {
                    console.error("Shift template save failed:", err);
                    setNotification({ type: 'error', message: err?.message || "An unexpected error interrupted the template save." });
                    return false;
                } finally {
                    setIsSavingShiftTemplates(false);
                }
            };

            const saveSelectedShiftAsTemplate = async (draftOverride = null, nameOverride = undefined) => {
                const templateDraftSource = draftOverride || adminTemplateDraft;
                const templateNameSource = nameOverride === undefined ? adminTemplateName : nameOverride;
                const label = String(templateNameSource || '').trim();
                if (!label) {
                    setNotification({ type: 'error', message: "Enter a template name first." });
                    return;
                }

                const schedIn = formatTimeField(templateDraftSource.schedIn, templateDraftSource.schedInPeriod);
                const schedOut = formatTimeField(templateDraftSource.schedOut, templateDraftSource.schedOutPeriod);
                if (!schedIn || !schedOut) {
                    setNotification({ type: 'error', message: "Enter valid scheduled in and out times before saving a template." });
                    return;
                }

                const normalizedTemplates = normalizeAdminShiftTemplates(settings.shiftTemplates);
                const existingIndex = normalizedTemplates.findIndex(template =>
                    String(template.label || '').trim().toLowerCase() === label.toLowerCase()
                );
                const nextTemplate = {
                    id: existingIndex >= 0 ? normalizedTemplates[existingIndex].id : buildShiftTemplateId(label),
                    label,
                    schedIn,
                    schedOut,
                    scheduleStatus: normalizeAdminScheduleStatus(templateDraftSource.scheduleStatus),
                };
                const nextTemplates = existingIndex >= 0
                    ? normalizedTemplates.map((template, index) => index === existingIndex ? nextTemplate : template)
                    : [...normalizedTemplates, nextTemplate];
                const didSave = await persistAdminShiftTemplates(
                    nextTemplates,
                    existingIndex >= 0 ? `Template updated: ${label}` : `Template saved: ${label}`
                );

                if (didSave) {
                    setAdminTemplateName('');
                    setAdminTemplateDraft(buildEmptyAdminTemplateDraft());
                }
            };

            const deleteAdminShiftTemplate = async (templateId) => {
                const normalizedTemplates = normalizeAdminShiftTemplates(settings.shiftTemplates);
                const targetTemplate = normalizedTemplates.find(template => template.id === templateId);
                if (!targetTemplate) return;

                const didSave = await persistAdminShiftTemplates(
                    normalizedTemplates.filter(template => template.id !== templateId),
                    `Template removed: ${targetTemplate.label}`
                );

                if (didSave && String(adminTemplateName || '').trim().toLowerCase() === String(targetTemplate.label || '').trim().toLowerCase()) {
                    setAdminTemplateName('');
                }
            };

            // Fetch Data on Mount
            useEffect(() => {
                const fetchData = async () => {
                    await refreshSheetData(false, { showSpinner: false, isInitialLoad: true });
                };

                fetchData();
            }, []);

            // Notification Effect
            useEffect(() => {
                if (notification) {
                    const timer = setTimeout(() => setNotification(null), 4000);
                    return () => clearTimeout(timer);
                }
            }, [notification]);

            const handleSelectionCancel = () => {
                setSelectedId(null);
                setPinInput("");
                setIsAuthenticated(false);
                setAdminUser(null);
                setViewMode('PINPAD');
                setEditTarget(null);
                setEmployeeTimeOffDraft(null);
                setMessageDraft('');
                setReactingMessageRowNumber(null);
                setReasonValidationTriggered(false);
                clearSessionTimeoutState();
            };

            const handleLogout = () => {
                handleSelectionCancel();
                setDirectoryMode('employee');
                setAdminWeekStart(getWeekStartDate(new Date()));
                setAdminScheduleDrafts({});
                setSelectedAdminCell(null);
                setAdminTemplateName('');
                setAdminTemplateDraft(buildEmptyAdminTemplateDraft());
            };

            const openAdminDirectory = async () => {
                handleSelectionCancel();
                setDirectoryMode('admin');
                setAdminTemplateName('');
                setAdminTemplateDraft(buildEmptyAdminTemplateDraft());
                await refreshSheetData(false, { showSpinner: false });
            };

            const returnToEmployeeDirectory = () => {
                handleSelectionCancel();
                setDirectoryMode('employee');
                setAdminWeekStart(getWeekStartDate(new Date()));
                setAdminScheduleDrafts({});
                setSelectedAdminCell(null);
                setAdminTemplateName('');
                setAdminTemplateDraft(buildEmptyAdminTemplateDraft());
            };

            // Activity Tracker
            useEffect(() => {
                const handleActivity = () => {
                    // Only update activity if warning is NOT showing.
                    // If warning is showing, we require explicit click to dismiss.
                    if (!showTimeoutWarning) {
                        lastActivityRef.current = Date.now();
                    }
                };

                window.addEventListener('click', handleActivity);
                window.addEventListener('keypress', handleActivity);
                window.addEventListener('mousemove', handleActivity);
                window.addEventListener('touchstart', handleActivity);

                return () => {
                    window.removeEventListener('click', handleActivity);
                    window.removeEventListener('keypress', handleActivity);
                    window.removeEventListener('mousemove', handleActivity);
                    window.removeEventListener('touchstart', handleActivity);
                };
            }, [showTimeoutWarning]);

            // Clock & Timeout Effect 
            useEffect(() => {
                const timer = setInterval(() => {
                    setCurrentTime(new Date());

                    // Check timeout logic if logged in
                    if (isAuthenticated) {
                        if (activeIdleLimit === null) {
                            setShowTimeoutWarning(false);
                            lastActivityRef.current = Date.now();
                            return;
                        }

                        const idleTime = Date.now() - lastActivityRef.current;
                        if (idleTime >= (activeIdleLimit + WARNING_TIME)) {
                            handleLogout();
                            setNotification({ type: 'info', message: "Session timed out due to inactivity" });
                        } else if (idleTime >= activeIdleLimit) {
                            setShowTimeoutWarning(true);
                        }
                    } else {
                        setShowTimeoutWarning(false);
                        lastActivityRef.current = Date.now(); // keep fresh while logged out
                    }
                }, 1000);
                return () => clearInterval(timer);
            }, [isAuthenticated, activeIdleLimit]);

            const selectedUser = employees.find(e => e.id === selectedId) || null;
            const selectedEmployee = selectedUser && !isAdminRole(selectedUser.role) ? selectedUser : null;
            const activeSessionUser = adminUser || selectedEmployee || null;
            const activeMessageViewer = adminUser || selectedEmployee || null;
            const publicEmployees = sortEmployeesForDisplay(
                employees.filter(emp => !isAdminRole(emp.role))
            );
            const adminAccounts = sortEmployeesForDisplay(
                employees.filter(emp => isAdminRole(emp.role))
            );
            const directoryEmployees = directoryMode === 'admin' ? adminAccounts : publicEmployees;
            const personalData = selectedEmployee 
                ? sheetData.filter(row => row.name === selectedEmployee.name) 
                : [];
            const activeEmployeeTimeOffRow = selectedEmployee && employeeTimeOffDraft
                ? getTimeOffRowForEmployeeDate(sheetData, selectedEmployee.name, employeeTimeOffDraft.date)
                : null;
            const todayKey = normalizeDate(new Date());
            const savedWeekOptions = Object.values(
                sheetData.reduce((acc, row) => {
                    if (isTimeOffRow(row)) return acc;
                    if (!hasTimeValue(row.schedIn) && !hasTimeValue(row.schedOut)) return acc;
                    if (normalizeDate(row.date) < todayKey) return acc;

                    const weekStartDate = getWeekStartDate(row.date);
                    const weekKey = normalizeDate(weekStartDate);
                    if (!acc[weekKey]) {
                        const weekEndDate = new Date(weekStartDate);
                        weekEndDate.setDate(weekEndDate.getDate() + 6);
                        acc[weekKey] = {
                            weekKey,
                            label: `${formatMonthDayDate(weekStartDate)} - ${formatMonthDayDate(weekEndDate)}`,
                            shiftCount: 0,
                        };
                    }

                    acc[weekKey].shiftCount += 1;
                    return acc;
                }, {})
            ).sort((a, b) => a.weekKey.localeCompare(b.weekKey));
            const stagedScheduleChangeCount = Object.keys(adminScheduleDrafts).length;
            const inventoryOpenRows = sortInventoryRows(getOpenInventoryRows(inventoryRows));
            const inventoryAwaitingRows = inventoryOpenRows.filter(row => Number(row.awaitingApproval || 0) > 0);
            const isAdminWorkspaceOpen = Boolean(isAuthenticated && adminUser && ['ADMIN', 'ADMIN_INVENTORY', 'ADMIN_PEN_HOSPITAL', 'ADMIN_PAYROLL', 'ADMIN_MESSAGES'].includes(viewMode));
            const editableRows = filterTimesheetRowsUpToToday(personalData)
                .filter(row => !isEntryLocked(row))
                .slice()
                .sort((a, b) => {
                    const aDate = parseLocalDate(a.date);
                    const bDate = parseLocalDate(b.date);
                    const aTime = isNaN(aDate.getTime()) ? 0 : aDate.getTime();
                    const bTime = isNaN(bDate.getTime()) ? 0 : bDate.getTime();
                    return aTime - bTime;
                });
            const editTargetIndex = editTarget
                ? editableRows.findIndex(row => isSameTimesheetEntry(row, editTarget))
                : -1;
            const canEditPrev = editTargetIndex > 0;
            const canEditNext = editTargetIndex >= 0 && editTargetIndex < editableRows.length - 1;
            const selectedClockInPlan = selectedEmployee
                ? resolveClockInPlan(sheetData, selectedEmployee.name, todayKey)
                : null;
            const selectedClockOutPlan = selectedEmployee
                ? resolveClockOutPlan(sheetData, selectedEmployee.name, todayKey)
                : null;
            const actionAlertPlan = [selectedClockInPlan, selectedClockOutPlan].find(plan =>
                plan &&
                plan.status === 'blocked' &&
                !['already-clocked-in', 'no-open-shift'].includes(plan.code)
            ) || null;
            const canClockIn = Boolean(selectedEmployee) && !isSubmittingAction && selectedClockInPlan?.status === 'ready';
            const canClockOut = Boolean(selectedEmployee) && !isSubmittingAction && selectedClockOutPlan?.status === 'ready';

            const submitInventoryAction = async (payload, successMessage, fallbackSuccessMessage = null) => {
                if (isSubmittingInventory) return false;

                lastActivityRef.current = Date.now();
                setIsSubmittingInventory(true);

                try {
                    const timestamp = buildActionTimestamp();
                    const result = await sendToSheet({
                        ...payload,
                        submittedAt: timestamp.isoTimestamp,
                        timezone: timestamp.timezone,
                        timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes,
                    });

                    if (!result.ok) {
                        setNotification({ type: 'error', message: result.error || "Could not save the inventory update." });
                        return false;
                    }

                    const refreshedInventory = await refreshInventory({ showSpinner: false });
                    if (refreshedInventory) {
                        setNotification({ type: 'success', message: successMessage });
                    } else {
                        setNotification({
                            type: 'info',
                            message: fallbackSuccessMessage || `${successMessage}. The latest inventory rows could not be reloaded automatically.`
                        });
                    }
                    return true;
                } catch (err) {
                    console.error("Inventory action failed:", err);
                    setNotification({ type: 'error', message: err?.message || "An unexpected error interrupted this inventory update." });
                    return false;
                } finally {
                    setIsSubmittingInventory(false);
                }
            };

            const submitPenHospitalAction = async (payload, successMessage, fallbackSuccessMessage = null) => {
                if (isSubmittingPenHospital) return false;

                lastActivityRef.current = Date.now();
                setIsSubmittingPenHospital(true);

                try {
                    const timestamp = buildActionTimestamp();
                    const result = await sendToSheet({
                        ...payload,
                        submittedAt: timestamp.isoTimestamp,
                        timezone: timestamp.timezone,
                        timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes,
                    });

                    if (!result.ok) {
                        setNotification({ type: 'error', message: result.error || "Could not save the Pen Hospital update." });
                        return false;
                    }

                    const refreshedCases = await refreshPenHospital({ showSpinner: false });
                    if (refreshedCases) {
                        setNotification({ type: 'success', message: successMessage });
                    } else {
                        setNotification({
                            type: 'info',
                            message: fallbackSuccessMessage || `${successMessage}. The latest Pen Hospital board could not be reloaded automatically.`
                        });
                    }
                    return true;
                } catch (err) {
                    console.error("Pen Hospital action failed:", err);
                    setNotification({ type: 'error', message: err?.message || "An unexpected error interrupted the Pen Hospital update." });
                    return false;
                } finally {
                    setIsSubmittingPenHospital(false);
                }
            };

            const handleOpenEmployeeInventory = async () => {
                setEmployeeTimeOffDraft(null);
                setViewMode('INVENTORY');
                await refreshInventory({ showSpinner: false });
            };

            const handleOpenEmployeePenHospital = async () => {
                setEmployeeTimeOffDraft(null);
                setViewMode('PEN_HOSPITAL');
                const rows = await refreshPenHospital({ showSpinner: false });
                if (rows === null) {
                    setNotification({ type: 'error', message: "Could not load the Pen Hospital board right now." });
                }
            };

            const handleOpenEmployeeMessages = async () => {
                setEmployeeTimeOffDraft(null);
                setViewMode('MESSAGES');
                const rows = await refreshMessages({ showSpinner: false });
                if (rows === null) {
                    setNotification({ type: 'error', message: "Could not load messages. If the web app was redeployed recently, make sure the latest Apps Script version was deployed." });
                }
            };

            const handleOpenEmployeeSchedule = async () => {
                setViewMode('SCHEDULE');
                await refreshLogs({ showSpinner: false });
            };

            const handleOpenEmployeeTimesheet = async () => {
                setEmployeeTimeOffDraft(null);
                setViewMode('TIMESHEET');
                await refreshLogs({ showSpinner: false });
            };

            const handleOpenAdminInventory = async () => {
                setEmployeeTimeOffDraft(null);
                setViewMode('ADMIN_INVENTORY');
                await refreshInventory({ showSpinner: false });
            };

            const handleOpenAdminPenHospital = async () => {
                setEmployeeTimeOffDraft(null);
                setViewMode('ADMIN_PEN_HOSPITAL');
                const rows = await refreshPenHospital({ showSpinner: false });
                if (rows === null) {
                    setNotification({ type: 'error', message: "Could not load the Pen Hospital board right now." });
                }
            };

            const handleOpenAdminPayroll = async () => {
                setEmployeeTimeOffDraft(null);
                setViewMode('ADMIN_PAYROLL');
                await refreshLogs({ showSpinner: false });
            };

            const handleOpenAdminMessages = async () => {
                setEmployeeTimeOffDraft(null);
                setViewMode('ADMIN_MESSAGES');
                const rows = await refreshMessages({ showSpinner: false });
                if (rows === null) {
                    setNotification({ type: 'error', message: "Could not load messages. If the web app was redeployed recently, make sure the latest Apps Script version was deployed." });
                }
            };

            const openEmployeeTimeOffRequest = (dateValue) => {
                if (!selectedEmployee) return;
                const existingRow = getTimeOffRowForEmployeeDate(sheetData, selectedEmployee.name, dateValue);
                setEmployeeTimeOffDraft(
                    existingRow
                        ? buildTimeOffRequestDraftFromRow(existingRow, dateValue)
                        : buildEmptyTimeOffRequestDraft(dateValue)
                );
            };

            const closeEmployeeTimeOffRequest = () => {
                setEmployeeTimeOffDraft(null);
            };

            const submitEmployeeTimeOffRequest = async () => {
                if (!selectedEmployee || !employeeTimeOffDraft || isSubmittingTimeOff) return false;

                const formattedIn = employeeTimeOffDraft.fullDay
                    ? ''
                    : formatTimeField(employeeTimeOffDraft.schedIn, employeeTimeOffDraft.schedInPeriod);
                const formattedOut = employeeTimeOffDraft.fullDay
                    ? ''
                    : formatTimeField(employeeTimeOffDraft.schedOut, employeeTimeOffDraft.schedOutPeriod);
                const isValidRange = employeeTimeOffDraft.fullDay
                    ? true
                    : Boolean(formattedIn && formattedOut && calculateWorkedMinutes(formattedIn, formattedOut));

                if (isPastScheduleDate(employeeTimeOffDraft.date)) {
                    setNotification({ type: 'error', message: "Time off can only be requested for today or a future date." });
                    return false;
                }

                if (!isValidRange) {
                    setNotification({ type: 'error', message: "Enter a valid blocked time range before sending this request." });
                    return false;
                }

                lastActivityRef.current = Date.now();
                setIsSubmittingTimeOff(true);

                try {
                    const latestRows = await refreshLogs({ showSpinner: false });
                    const latestRequestRow = getTimeOffRowForEmployeeDate(latestRows || sheetData, selectedEmployee.name, employeeTimeOffDraft.date);
                    const timestamp = buildActionTimestamp();
                    const result = await sendToSheet({
                        action: "REQUEST_TIME_OFF",
                        name: selectedEmployee.name,
                        date: normalizeDate(employeeTimeOffDraft.date),
                        fullDay: Boolean(employeeTimeOffDraft.fullDay),
                        schedIn: employeeTimeOffDraft.fullDay ? '' : formattedIn,
                        schedOut: employeeTimeOffDraft.fullDay ? '' : formattedOut,
                        editorName: selectedEmployee.name,
                        editorRole: selectedEmployee.role || 'employee',
                        submittedAt: timestamp.isoTimestamp,
                        timezone: timestamp.timezone,
                        timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes,
                        ...buildRowContextPayload(latestRequestRow),
                    });

                    if (!result.ok) {
                        setNotification({ type: 'error', message: result.error || "Could not save the time-off request." });
                        return false;
                    }

                    const refreshedRows = await refreshLogs({ showSpinner: false });
                    if (refreshedRows) {
                        setNotification({ type: 'success', message: `Time-off request sent for ${formatFullDate(employeeTimeOffDraft.date)}.` });
                    } else {
                        setNotification({ type: 'info', message: "The request was sent, but the latest schedule rows could not be reloaded automatically." });
                    }
                    setEmployeeTimeOffDraft(null);
                    return true;
                } catch (err) {
                    console.error("Time-off request failed:", err);
                    setNotification({ type: 'error', message: err?.message || "An unexpected error interrupted the time-off request." });
                    return false;
                } finally {
                    setIsSubmittingTimeOff(false);
                }
            };

            const submitAdminTimeOffAction = async (action, row, successMessage) => {
                if (!adminUser || !row || isSubmittingTimeOff) return false;

                lastActivityRef.current = Date.now();
                setIsSubmittingTimeOff(true);

                try {
                    const latestRows = await refreshLogs({ showSpinner: false });
                    const latestRequestRow = getTimeOffRowForEmployeeDate(latestRows || sheetData, row.name, row.date);
                    const timestamp = buildActionTimestamp();
                    const result = await sendToSheet({
                        action,
                        name: row.name,
                        date: normalizeDate(row.date),
                        editorName: adminUser.name,
                        editorRole: adminUser.role || 'admin',
                        submittedAt: timestamp.isoTimestamp,
                        timezone: timestamp.timezone,
                        timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes,
                        ...buildRowContextPayload(latestRequestRow || row),
                    });

                    if (!result.ok) {
                        setNotification({ type: 'error', message: result.error || "Could not update that time-off request." });
                        return false;
                    }

                    const refreshedRows = await refreshLogs({ showSpinner: false });
                    if (refreshedRows) {
                        setNotification({ type: 'success', message: successMessage });
                    } else {
                        setNotification({ type: 'info', message: `${successMessage} The latest schedule rows could not be reloaded automatically.` });
                    }
                    setSelectedAdminCell(null);
                    return true;
                } catch (err) {
                    console.error("Admin time-off action failed:", err);
                    setNotification({ type: 'error', message: err?.message || "An unexpected error interrupted the time-off update." });
                    return false;
                } finally {
                    setIsSubmittingTimeOff(false);
                }
            };

            const handleApproveTimeOff = async (row) => {
                return submitAdminTimeOffAction(
                    "ADMIN_APPROVE_TIME_OFF",
                    row,
                    `${row.name}'s time off was approved for ${formatFullDate(row.date)}.`
                );
            };

            const handleClearTimeOff = async (row) => {
                return submitAdminTimeOffAction(
                    "ADMIN_CLEAR_TIME_OFF",
                    row,
                    `Time off was cleared for ${row.name} on ${formatFullDate(row.date)}.`
                );
            };

            const mergeUpdatedMessageRow = (updatedMessageRow) => {
                if (!updatedMessageRow?.rowNumber) return;
                setMessages(prev => {
                    let didReplace = false;
                    const nextMessages = prev.map(message => {
                        if (message?.rowNumber !== updatedMessageRow.rowNumber) return message;
                        didReplace = true;
                        return {
                            ...message,
                            ...updatedMessageRow,
                            reactions: sanitizeMessageReactions(updatedMessageRow.reactions),
                        };
                    });
                    return didReplace ? nextMessages : prev;
                });
            };

            const submitMessage = async () => {
                const activeUser = adminUser || selectedEmployee;
                const messageText = normalizeMessageText(messageDraft);
                if (!activeUser || isSubmittingMessage) return false;

                if (!messageText) {
                    setNotification({ type: 'error', message: "Enter a note before sending it." });
                    return false;
                }
                if (messageText.length > MESSAGE_MAX_LENGTH) {
                    setNotification({ type: 'error', message: `Notes must be ${MESSAGE_MAX_LENGTH} characters or less.` });
                    return false;
                }

                lastActivityRef.current = Date.now();
                setIsSubmittingMessage(true);

                try {
                    const timestamp = buildActionTimestamp();
                    const result = await sendToSheet({
                        action: "POST_MESSAGE",
                        editorName: activeUser.name,
                        editorRole: activeUser.role || (adminUser ? 'admin' : 'employee'),
                        message: messageText,
                        submittedAt: timestamp.isoTimestamp,
                        timezone: timestamp.timezone,
                        timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes,
                    });

                    if (!result.ok) {
                        const messageText = String(result.error || '').trim();
                        const isUnsupportedMessageAction = /Unsupported action:\s*POST_MESSAGE/i.test(messageText);
                        setNotification({
                            type: 'error',
                            message: isUnsupportedMessageAction
                                ? "The live Apps Script deployment is still the older version and does not support messages yet. Redeploy the latest web app version, then try again."
                                : (result.error || "Could not post that note.")
                        });
                        return false;
                    }

                    const refreshedMessages = await refreshMessages({ showSpinner: false });
                    if (refreshedMessages) {
                        setNotification({ type: 'success', message: "Note posted to the shared board." });
                    } else {
                        setNotification({ type: 'info', message: "The note was posted, but the latest board could not be refreshed automatically." });
                    }
                    setMessageDraft('');
                    return true;
                } catch (err) {
                    console.error("Message post failed:", err);
                    setNotification({ type: 'error', message: err?.message || "An unexpected error interrupted the note." });
                    return false;
                } finally {
                    setIsSubmittingMessage(false);
                }
            };

            const submitMessageReaction = async (message, reactionKey) => {
                const activeUser = adminUser || selectedEmployee;
                const normalizedReaction = normalizeMessageReactionKey(reactionKey);
                if (!activeUser || !message?.rowNumber || !normalizedReaction || reactingMessageRowNumber) return false;

                lastActivityRef.current = Date.now();
                setReactingMessageRowNumber(message.rowNumber);

                try {
                    const timestamp = buildActionTimestamp();
                    const result = await sendToSheet({
                        action: "TOGGLE_MESSAGE_REACTION",
                        rowNumber: message.rowNumber,
                        editorName: activeUser.name,
                        editorRole: activeUser.role || (adminUser ? 'admin' : 'employee'),
                        reaction: normalizedReaction,
                        submittedAt: timestamp.isoTimestamp,
                        timezone: timestamp.timezone,
                        timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes,
                    });

                    if (!result.ok) {
                        const reactionErrorText = String(result.error || '').trim();
                        const isUnsupportedReactionAction = /Unsupported action:\s*TOGGLE_MESSAGE_REACTION/i.test(reactionErrorText);
                        setNotification({
                            type: 'error',
                            message: isUnsupportedReactionAction
                                ? "The live Apps Script deployment does not support message reactions yet. Redeploy the latest web app version, then try again."
                                : (result.error || "Could not save that reaction.")
                        });
                        return false;
                    }

                    const updatedMessageRow = result?.parsed?.messageRow;
                    if (updatedMessageRow?.rowNumber) {
                        mergeUpdatedMessageRow(updatedMessageRow);
                        return true;
                    }

                    const refreshedMessages = await refreshMessages({ showSpinner: false });
                    if (!refreshedMessages) {
                        setNotification({ type: 'info', message: "The reaction was saved, but the latest board could not be refreshed automatically." });
                    }
                    return true;
                } catch (err) {
                    console.error("Message reaction failed:", err);
                    setNotification({ type: 'error', message: err?.message || "An unexpected error interrupted the reaction." });
                    return false;
                } finally {
                    setReactingMessageRowNumber(null);
                }
            };

            const handleInventoryStart = async (row, quantity) => {
                return submitInventoryAction(
                    {
                        action: "INVENTORY_START",
                        rowNumber: row.rowNumber,
                        quantity,
                    },
                    `${quantity} ${quantity === 1 ? 'item' : 'items'} started for ${row.sku}.`
                );
            };

            const handleInventoryFinish = async (row, quantity) => {
                return submitInventoryAction(
                    {
                        action: "INVENTORY_FINISH",
                        rowNumber: row.rowNumber,
                        quantity,
                    },
                    `${quantity} ${quantity === 1 ? 'item' : 'items'} moved to Awaiting Approval for ${row.sku}.`
                );
            };

            const handleInventoryAddNeed = async (sku, product, quantity) => {
                if (!adminUser) return false;
                const itemLabel = product ? `${product} (${sku})` : sku;
                return submitInventoryAction(
                    {
                        action: "INVENTORY_ADD_NEED",
                        sku,
                        product,
                        quantity,
                        editorName: adminUser.name,
                        editorRole: adminUser.role || 'admin',
                    },
                    `${itemLabel} now has ${quantity} more item${quantity === 1 ? '' : 's'} needed.`
                );
            };

            const handleInventoryAdjustNeed = async (row, quantityDelta) => {
                if (!adminUser) return false;
                return submitInventoryAction(
                    {
                        action: "INVENTORY_ADJUST_NEED",
                        rowNumber: row.rowNumber,
                        quantityDelta,
                        editorName: adminUser.name,
                        editorRole: adminUser.role || 'admin',
                    },
                    `${row.sku} needed quantity was adjusted by ${quantityDelta}.`
                );
            };

            const handleInventoryApprove = async (row, quantity) => {
                if (!adminUser) return false;
                return submitInventoryAction(
                    {
                        action: "INVENTORY_APPROVE",
                        rowNumber: row.rowNumber,
                        quantity,
                        editorName: adminUser.name,
                        editorRole: adminUser.role || 'admin',
                    },
                    `${quantity} ${quantity === 1 ? 'item was' : 'items were'} approved for ${row.sku}.`,
                    `${quantity} ${quantity === 1 ? 'item was' : 'items were'} approved for ${row.sku}, but the inventory board could not be refreshed automatically.`
                );
            };

            const handleInventoryRejectAwaiting = async (row, quantity) => {
                if (!adminUser) return false;
                return submitInventoryAction(
                    {
                        action: "INVENTORY_REJECT_AWAITING",
                        rowNumber: row.rowNumber,
                        quantity,
                        editorName: adminUser.name,
                        editorRole: adminUser.role || 'admin',
                    },
                    `${quantity} ${quantity === 1 ? 'item was' : 'items were'} sent back from Awaiting Approval for ${row.sku}.`
                );
            };

            const handleCreatePenHospitalCase = async (customerName, expectedCount, diagnosis = '', penNames = '') => {
                if (!adminUser) return false;
                return submitPenHospitalAction(
                    {
                        action: "PEN_HOSPITAL_CREATE_CASE",
                        customerName,
                        expectedCount,
                        diagnosis,
                        penNames,
                        editorName: adminUser.name,
                        editorRole: adminUser.role || 'admin',
                    },
                    `Pen Hospital case created for ${customerName}.`
                );
            };

            const handleUpdatePenHospitalStatus = async (caseRow, nextStatus) => {
                const activeUser = adminUser || selectedEmployee;
                if (!activeUser || !caseRow?.rowNumber || !nextStatus) return false;

                return submitPenHospitalAction(
                    {
                        action: "PEN_HOSPITAL_UPDATE_STATUS",
                        rowNumber: caseRow.rowNumber,
                        status: nextStatus,
                        editorName: activeUser.name,
                        editorRole: activeUser.role || (adminUser ? 'admin' : 'employee'),
                    },
                    `${String(caseRow.customerName || 'This case').trim() || 'This case'} moved to ${nextStatus}.`
                );
            };

            useEffect(() => {
                if (employees.length === 0) return;
                setEmployees(prev => {
                    let changed = false;
                    const next = prev.map(emp => {
                        const isClockedIn = hasOpenShiftForToday(sheetData, emp.name);
                        if (emp.isClockedIn === isClockedIn) return emp;
                        changed = true;
                        return { ...emp, isClockedIn };
                    });
                    return changed ? next : prev;
                });
            }, [sheetData, employees.length]);

            const handleEmployeeSelect = async (id) => {
                setSelectedId(id);
                setPinInput("");
                setIsAuthenticated(false);
                setAdminUser(null);
                setViewMode('PINPAD');
                setEmployeeTimeOffDraft(null);
                clearSessionTimeoutState();

                await refreshSheetData(false);
            };

            const saveAdminWeekSchedules = async () => {
                if (!adminUser || !isAdminRole(adminUser.role) || isSubmittingAdminSchedule) return;
                const stagedDrafts = Object.values(adminScheduleDrafts);
                if (stagedDrafts.length === 0) {
                    setNotification({ type: 'info', message: "No schedule changes are staged yet." });
                    return;
                }

                const invalidDraft = stagedDrafts.find(draft =>
                    !draft.clearSchedule &&
                    (!formatTimeField(draft.schedIn, draft.schedInPeriod) || !formatTimeField(draft.schedOut, draft.schedOutPeriod))
                );
                if (invalidDraft) {
                    selectAdminCell(invalidDraft.name, invalidDraft.date);
                    setNotification({ type: 'error', message: `Enter valid scheduled in/out times for ${invalidDraft.name} on ${formatFullDate(invalidDraft.date)}.` });
                    return;
                }

                setIsSubmittingAdminSchedule(true);
                try {
                    const latestRows = await refreshLogs();
                    if (!latestRows) {
                        setNotification({ type: 'error', message: "Could not refresh the latest schedule rows. Nothing was saved." });
                        return;
                    }

                    const payloadEntries = [];
                    for (const draft of stagedDrafts) {
                        let latestSourceRow = null;
                        if (draft.sourceRow) {
                            const sourceKey = buildRowFingerprint(draft.sourceRow);
                            latestSourceRow = latestRows.find(row => buildRowFingerprint(row) === sourceKey) || null;
                            if (!latestSourceRow) {
                                selectAdminCell(draft.name, draft.date);
                                setNotification({ type: 'error', message: `The schedule row for ${draft.name} on ${formatFullDate(draft.date)} changed before it could be updated. Reload it and try again.` });
                                return;
                            }
                        } else {
                            latestSourceRow = getScheduleRowForEmployeeDate(latestRows, draft.name, draft.date);
                        }

                        payloadEntries.push({
                            name: draft.name,
                            date: normalizeDate(draft.date),
                            schedIn: draft.clearSchedule ? '' : formatTimeField(draft.schedIn, draft.schedInPeriod),
                            schedOut: draft.clearSchedule ? '' : formatTimeField(draft.schedOut, draft.schedOutPeriod),
                            scheduleStatus: draft.clearSchedule ? '' : normalizeAdminScheduleStatus(draft.scheduleStatus),
                            clearSchedule: Boolean(draft.clearSchedule),
                            ...buildRowContextPayload(latestSourceRow),
                        });
                    }

                    const result = await sendToSheet({
                        action: "ADMIN_BATCH_UPSERT_SCHEDULES",
                        editorName: adminUser.name,
                        editorRole: adminUser.role || 'admin',
                        entries: payloadEntries,
                    });
                    if (!result.ok) {
                        setNotification({ type: 'error', message: result.error || "Could not save the staged schedules." });
                        return;
                    }

                    const refreshedRows = await refreshLogs();
                    const isStructuredSheetSuccess = String(result?.parsed?.status || '').toLowerCase() === 'success';
                    const refreshConfirmedSchedule = Boolean(refreshedRows) && payloadEntries.every(entry =>
                        entry.clearSchedule
                            ? isExpectedScheduleCellCleared(refreshedRows, entry)
                            : Boolean(getExpectedScheduleRow(refreshedRows, entry))
                    );

                    if (refreshConfirmedSchedule) {
                        setNotification({
                            type: 'success',
                            message: `${payloadEntries.length} schedule change${payloadEntries.length === 1 ? '' : 's'} saved`
                        });
                        setAdminScheduleDrafts({});
                    } else if (isStructuredSheetSuccess && !refreshedRows) {
                        setNotification({ type: 'info', message: "The server confirmed the weekly save, but the latest sheet rows could not be reloaded automatically yet." });
                    } else if (result.isLegacyTextSuccess) {
                        setNotification({
                            type: 'error',
                            message: "This weekly schedule save could not be confirmed in the spreadsheet. The live Apps Script deployment is still the older version and needs the updated web-app deployment before batch schedule saves can be verified safely."
                        });
                    } else {
                        setNotification({ type: 'error', message: "These weekly schedule changes could not be confirmed in the latest spreadsheet rows." });
                    }
                } catch (err) {
                    console.error("Admin week schedule save failed:", err);
                    setNotification({ type: 'error', message: err?.message || "An unexpected error interrupted the weekly schedule save." });
                } finally {
                    setIsSubmittingAdminSchedule(false);
                }
            };

            const handlePinPress = (num) => {
                if (!selectedId) return;
                if (pinInput.length < 4) {
                    const newPin = pinInput + num;
                    setPinInput(newPin);
                    if (newPin.length === 4) validatePin(newPin);
                }
            };

            const handlePinBackspace = () => {
                setPinInput(prev => prev.slice(0, -1));
            };

            const handlePinClear = () => setPinInput("");

            const validatePin = async (inputPin) => {
                const emp = employees.find(e => e.id === selectedId);
                if (!emp) {
                    setNotification({ type: 'error', message: "That employee record changed. Please select your name again." });
                    handleSelectionCancel();
                    return;
                }
                if (inputPin === emp.pin) {
                    const isAdminAccount = isAdminRole(emp.role);
                    setIsAuthenticated(true);
                    setPinInput("");
                    setViewMode(isAdminAccount ? 'ADMIN' : 'TIMESHEET');
                    setAdminUser(isAdminAccount ? emp : null);
                    setDirectoryMode(isAdminAccount ? 'admin' : 'employee');
                    clearSessionTimeoutState();
                    setNotification({
                        type: 'success',
                        message: isAdminAccount ? `Admin Access: ${emp.name}` : `Identity Verified: ${emp.name}`
                    });
                    await refreshSheetData(false);
                } else {
                    setNotification({ type: 'error', message: "Incorrect PIN" });
                    setPinInput("");
                }
            };

            // Keyboard listener for PIN entry
            useEffect(() => {
                const handleKeyDown = (e) => {
                    if (viewMode !== 'PINPAD' || !selectedId) return;
                    
                    if (e.key >= '0' && e.key <= '9') {
                        handlePinPress(e.key);
                    } else if (e.key === 'Backspace') {
                        e.preventDefault();
                        handlePinBackspace();
                    } else if (e.key === 'Delete' || e.key === 'Escape') {
                        e.preventDefault();
                        handlePinClear();
                    }
                };

                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, [viewMode, selectedId, pinInput, employees]); // Re-bind to ensure state closure is fresh

            const handleClockAction = async (actionType) => {
                if (!selectedEmployee || isSubmittingAction) return;

                lastActivityRef.current = Date.now();
                setIsSubmittingAction(true);
                try {
                    const latestRows = await refreshLogs();
                    if (!latestRows) {
                        setNotification({ type: 'error', message: "Could not refresh the latest timesheet rows. Punch was not submitted." });
                        return;
                    }

                    const timestamp = buildActionTimestamp();
                    const plan = actionType === "CLOCK_IN"
                        ? resolveClockInPlan(latestRows, selectedEmployee.name, timestamp.localDate)
                        : resolveClockOutPlan(latestRows, selectedEmployee.name, timestamp.localDate);

                    if (!plan || plan.status !== 'ready') {
                        setNotification({ type: 'error', message: plan?.message || "This punch could not be matched safely." });
                        return;
                    }

                    const actionPayload = {
                        action: actionType,
                        date: timestamp.localDate,
                        time: timestamp.localTime,
                        name: selectedEmployee.name,
                        submittedAt: timestamp.isoTimestamp,
                        timezone: timestamp.timezone,
                        timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes,
                        resolutionCode: plan.code,
                        ...buildRowContextPayload(plan.row),
                    };

                    if (actionType === "CLOCK_IN") {
                        actionPayload.reason = getLateStartNote(plan.row?.schedIn, timestamp.localTime);
                    } else {
                        Object.assign(actionPayload, buildWorkedDurationFields(plan.row?.timeIn || '', timestamp.localTime));
                    }

                    const result = await sendToSheet(actionPayload);
                    if (!result.ok) {
                        setNotification({ type: 'error', message: result.error || "Could not save this punch." });
                        return;
                    }

                    const isStructuredSheetSuccess = String(result?.parsed?.status || '').toLowerCase() === 'success';
                    const localRows = isStructuredSheetSuccess
                        ? applySuccessfulPunchLocally(
                            latestRows,
                            actionType,
                            selectedEmployee.name,
                            timestamp,
                            plan,
                            actionPayload.reason || ''
                        )
                        : null;
                    const expectedSavedRow = localRows
                        ? getExpectedActionRow(
                            localRows,
                            actionType,
                            selectedEmployee.name,
                            timestamp,
                            plan
                        )
                        : null;

                    const refreshedRows = await refreshLogs();
                    const successMessage = actionType === "CLOCK_IN"
                        ? "Clocked In Successfully"
                        : "Clocked Out Successfully";

                    const refreshConfirmedPunch = Boolean(
                        refreshedRows &&
                        expectedSavedRow &&
                        getExpectedActionRow(
                            refreshedRows,
                            actionType,
                            selectedEmployee.name,
                            timestamp,
                            plan
                        )
                    );

                    if (refreshConfirmedPunch) {
                        setNotification({ type: actionType === "CLOCK_IN" ? 'success' : 'info', message: successMessage });
                    } else if (isStructuredSheetSuccess && !refreshedRows && localRows) {
                        setSheetData(localRows);
                        setNotification({
                            type: 'info',
                            message: `${successMessage}. The server confirmed the save, but the latest sheet rows could not be reloaded automatically yet. Please verify the spreadsheet before the employee leaves this screen.`
                        });
                    } else if (result.isLegacyTextSuccess) {
                        setNotification({
                            type: 'error',
                            message: "This punch could not be confirmed in the spreadsheet. The live Apps Script deployment is still returning the older plain-text Success response, so it needs the updated web-app deployment before punches can be verified safely."
                        });
                    } else {
                        setNotification({
                            type: 'error',
                            message: "This punch could not be confirmed in the latest spreadsheet rows. Please review the sheet before the employee leaves this screen."
                        });
                    }
                } catch (err) {
                    console.error("Clock action failed:", err);
                    setNotification({ type: 'error', message: err?.message || "An unexpected error interrupted this punch." });
                } finally {
                    setIsSubmittingAction(false);
                }
            };

            const loadEditRow = (row) => {
                const parsedIn = parseTimeField(row.timeIn);
                const parsedOut = parseTimeField(row.timeOut || '');
                setEditTarget(row);
                setReasonValidationTriggered(false);
                setEditForm({ 
                    timeIn: parsedIn.time,
                    timeInPeriod: parsedIn.period,
                    timeOut: parsedOut.time,
                    timeOutPeriod: parsedOut.period,
                    oldReason: row.reason || '',
                    newReason: ''
                });
            };

            const startEdit = (row) => {
                if (isEntryLocked(row)) {
                    setNotification({ type: 'error', message: "This entry is locked and cannot be edited." });
                    return;
                }
                loadEditRow(row);
                setViewMode('EDIT');
            };

            const handleEditPrev = () => {
                if (!canEditPrev) return;
                loadEditRow(editableRows[editTargetIndex - 1]);
            };

            const handleEditNext = () => {
                if (!canEditNext) return;
                loadEditRow(editableRows[editTargetIndex + 1]);
            };

            const saveEdit = async () => {
                if (isSubmittingAction) return;
                if (isEntryLocked(editTarget)) {
                    setNotification({ type: 'error', message: "This entry is locked and cannot be edited." });
                    setViewMode('TIMESHEET');
                    return;
                }

                if (!editForm.newReason.trim()) {
                    setReasonValidationTriggered(true);
                    setNotification({ type: 'error', message: "A reason for editing is required." });
                    return;
                }
                setReasonValidationTriggered(false);

                const updatedTimeIn = formatTimeField(editForm.timeIn, editForm.timeInPeriod);
                const updatedTimeOut = editForm.timeOut
                    ? formatTimeField(editForm.timeOut, editForm.timeOutPeriod)
                    : '';

                if (!updatedTimeIn) {
                    setNotification({ type: 'error', message: "Enter a valid Time In (h:mm + AM/PM)." });
                    return;
                }
                if (editForm.timeOut && !updatedTimeOut) {
                    setNotification({ type: 'error', message: "Enter a valid Time Out (h:mm + AM/PM)." });
                    return;
                }

                const history = parseReasonCell(editForm.oldReason)
                    .map(entry => ({
                        t: entry.rawTimestamp || entry.timestamp || '',
                        by: entry.editor || '',
                        n: entry.note || '',
                    }))
                    .filter(entry => entry.n.trim() !== '');
                history.push({
                    t: new Date().toISOString(),
                    by: selectedEmployee?.name || '',
                    n: editForm.newReason.trim(),
                });
                const combinedReason = JSON.stringify(history);
                const durationFields = buildWorkedDurationFields(updatedTimeIn, updatedTimeOut);
                const editTimestamp = buildActionTimestamp();

                const payload = {
                    action: "EDIT",
                    date: normalizeDate(editTarget.date), 
                    name: editTarget.name,
                    newTimeIn: updatedTimeIn,
                    newTimeOut: updatedTimeOut,
                    editorName: selectedEmployee?.name || '',
                    editorRole: selectedEmployee?.role || 'employee',
                    reason: combinedReason,
                    submittedAt: editTimestamp.isoTimestamp,
                    timezone: editTimestamp.timezone,
                    timezoneOffsetMinutes: editTimestamp.timezoneOffsetMinutes,
                    ...buildRowContextPayload(editTarget),
                    ...durationFields,
                };

                setIsSubmittingAction(true);
                try {
                    const result = await sendToSheet(payload);
                    if (!result.ok) {
                        setNotification({ type: 'error', message: result.error || "Could not update the timesheet." });
                        return;
                    }

                    const refreshedRows = await refreshLogs();
                    if (refreshedRows) {
                        setNotification({ type: 'success', message: "Timesheet Updated" });
                    } else {
                        setNotification({ type: 'info', message: "Timesheet updated, but the latest rows could not be reloaded automatically." });
                    }
                    setViewMode('TIMESHEET');
                } finally {
                    setIsSubmittingAction(false);
                }
            };

            const sendToSheet = async (payload) => {
                if (!scriptUrl) {
                    return { ok: false, error: "The timeclock endpoint is not configured." };
                }

                try {
                    const response = await fetch(scriptUrl, {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });

                    const rawText = await response.text();
                    if (!response.ok) {
                        throw new Error(`Sheet request failed (${response.status})`);
                    }

                    if (rawText && String(rawText).trim().toLowerCase().startsWith('error')) {
                        throw new Error(String(rawText).trim());
                    }

                    if (rawText) {
                        try {
                            const parsed = JSON.parse(rawText);
                            if (String(parsed?.status || '').toLowerCase() === 'error') {
                                throw new Error(parsed.message || 'The sheet reported an error.');
                            }
                            return { ok: true, parsed, rawText };
                        } catch (parseError) {
                            if (!/Unexpected token/i.test(parseError.message || '')) {
                                throw parseError;
                            }
                        }
                    }

                    return {
                        ok: true,
                        rawText,
                        isLegacyTextSuccess: String(rawText || '').trim() === 'Success'
                    };
                } catch (err) {
                    console.error("Network Error:", err);
                    return { ok: false, error: err?.message || "Could not reach the timesheet service." };
                }
            };

            return (
                <div className="min-h-screen p-2 md:p-8 flex flex-col items-center">
                    {/* Header */}
                    <div className="page-width flex justify-between items-center mb-4 md:mb-8 brutal-card panel-shell-padding">
                        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                            <button
                                onClick={openAdminDirectory}
                                className={`brutal-btn flex items-center justify-center shrink-0 overflow-hidden ${
                                    settings.logoUrl
                                        ? 'bg-white p-0.5 md:p-1'
                                        : 'bg-[#38bdf8] w-8 h-8 md:w-12 md:h-12 text-sm md:text-xl'
                                }`}
                                title="Open admin menu"
                                aria-label="Open admin menu"
                            >
                            {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="h-8 md:h-12 w-auto object-contain drop-shadow-md shrink-0" />
                            ) : (
                                <span className="leading-none" aria-hidden="true">&#128040;</span>
                            )}
                            </button>
                            <div className="w-[170px] sm:w-[220px] md:w-[360px] lg:w-[460px] min-w-0">
                                <div className="min-w-0">
                                    <h1 className="text-lg md:text-3xl font-bold font-poppins text-[#060606] truncate min-h-[1.75rem] md:min-h-[2.25rem]">{settings.companyName || '\u00A0'}</h1>
                                </div>
                                <p className="text-gray-600 font-bold text-[10px] md:text-base truncate">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className="flex items-center shrink-0 ml-2">
                            <div className="text-xl md:text-5xl font-bold font-poppins text-[#060606] tracking-tighter">
                                {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} 
                            </div>
                        </div>
                    </div>

                    <div className="page-width app-shell">
                        
                        {/* LEFT: Employee Selection & Actions */}
                        <div className="left-panel">
                            
                            {/* Employee List (Hides when a user is authenticated, or on mobile when selected) */}
                            <div className={`brutal-card left-panel-card left-panel-card-padding transition-all duration-300 ${!selectedId ? 'block' : isAuthenticated ? 'hidden' : 'hidden lg:block'}`}>
                                <div className="flex items-start justify-between gap-3 mb-4 md:mb-6">
                                    <div>
                                        <h2 className="text-lg md:text-xl font-bold font-poppins text-[#060606] flex items-center gap-2 md:gap-3">
                                            <i className={`fas ${directoryMode === 'admin' ? 'fa-user-shield text-[#38bdf8]' : 'fa-users text-[#f43f5e]'} text-xl md:text-2xl`}></i>
                                            {directoryMode === 'admin' ? 'Admin Menu' : 'Select Name'}
                                        </h2>
                                        {directoryMode === 'admin' && (
                                            <p className="text-xs md:text-sm font-bold text-gray-600 mt-2">
                                                Only admin, manager, and owner accounts appear here.
                                            </p>
                                        )}
                                    </div>
                                    {directoryMode === 'admin' && (
                                        <button onClick={returnToEmployeeDirectory} className="brutal-btn bg-white px-3 py-2 text-xs md:text-sm whitespace-nowrap">
                                            Back to Staff
                                        </button>
                                    )}
                                </div>

                                {isLoadingEmployees ? (
                                    <div className="flex flex-col items-center justify-center h-32 md:h-48 text-[#060606] font-bold gap-3">
                                        <i className="fas fa-circle-notch spinner text-3xl md:text-4xl text-[#38bdf8]"></i>
                                        <p className="text-sm md:text-base">Loading team...</p>
                                    </div>
                                ) : fetchError ? (
                                    <div className="flex flex-col items-center justify-center h-32 md:h-48 text-[#f43f5e] gap-2 md:gap-3 text-center">
                                        <i className="fas fa-exclamation-circle text-3xl md:text-4xl"></i>
                                        <p className="font-bold text-xs md:text-base">{fetchError}</p>
                                        <button onClick={() => window.location.reload()} className="brutal-btn bg-white py-1 md:py-2 px-3 md:px-4 mt-2 text-sm md:text-base">Retry</button>
                                    </div>
                                ) : (
                                    directoryEmployees.length === 0 ? (
                                        <div className="rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400">
                                            {directoryMode === 'admin'
                                                ? 'No admin-capable accounts are active in the Employees sheet yet.'
                                                : 'No active employee accounts were found.'}
                                        </div>
                                    ) : (
                                        <div className="standard-two-up-grid">
                                            {directoryEmployees.map(emp => (
                                                <button
                                                    key={emp.id}
                                                    onClick={() => handleEmployeeSelect(emp.id)}
                                                    className={`
                                                        brutal-btn standard-unit-button flex flex-col items-center justify-center gap-1 relative
                                                        ${selectedId === emp.id ? 'bg-[#38bdf8]' : emp.isClockedIn ? 'bg-[#a7f3d0]' : 'bg-white hover:bg-gray-50'}
                                                    `}
                                                >
                                                    {emp.isClockedIn && (
                                                        <div className="absolute top-1.5 md:top-2 right-1.5 md:right-2 flex items-center gap-1">
                                                            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#10b981] border border-black animate-pulse"></div>
                                                        </div>
                                                    )}
                                                    <span className="font-bold font-poppins text-[#060606] text-center text-sm md:text-base lg:text-lg leading-tight">{emp.name}</span>
                                                    <span className="text-[9px] md:text-[10px] lg:text-xs font-bold opacity-70 text-[#060606]">
                                                        {directoryMode === 'admin' ? String(emp.role || 'admin').toUpperCase() : emp.department}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Employee Actions */}
                            {isAuthenticated && !adminUser && (
                                <div className="brutal-card left-panel-card left-panel-card-padding animate-fade-in bg-white">
                                    <h2 className="text-lg md:text-xl font-bold font-poppins text-[#060606] mb-5 truncate">Hello, {selectedEmployee?.name}!</h2>
                                    <div className="standard-two-up-grid">
                                        <button
                                            onClick={handleOpenEmployeeTimesheet}
                                            className={`brutal-btn standard-unit-button stacked-action-button text-[#060606] ${
                                                ['TIMESHEET', 'EDIT'].includes(viewMode) ? 'bg-[#38bdf8] hover:bg-[#0ea5e9]' : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className="fas fa-clock text-[#060606]"></i>
                                            <span>Timesheet</span>
                                        </button>
                                        <button
                                            onClick={handleOpenEmployeeSchedule}
                                            className={`brutal-btn standard-unit-button stacked-action-button text-[#060606] ${
                                                viewMode === 'SCHEDULE' ? 'bg-[#38bdf8] hover:bg-[#0ea5e9]' : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className="fas fa-calendar-day text-[#060606]"></i>
                                            <span>Schedule</span>
                                        </button>
                                        <button
                                            onClick={handleOpenEmployeeInventory}
                                            className={`brutal-btn standard-unit-button stacked-action-button text-[#060606] ${
                                                viewMode === 'INVENTORY' ? 'bg-[#fef3c7] hover:bg-[#fde68a]' : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className="fas fa-boxes-stacked text-[#f97316]"></i>
                                            <span>Inventory</span>
                                        </button>
                                        <button
                                            onClick={handleOpenEmployeePenHospital}
                                            className={`brutal-btn standard-unit-button stacked-action-button text-[#060606] ${
                                                viewMode === 'PEN_HOSPITAL' ? 'bg-[#ccfbf1] hover:bg-[#99f6e4]' : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className="fas fa-suitcase-medical text-[#0f766e]"></i>
                                            <span>Pen Hospital</span>
                                        </button>
                                        <button
                                            onClick={handleOpenEmployeeMessages}
                                            className={`brutal-btn standard-unit-button stacked-action-button text-[#060606] ${
                                                viewMode === 'MESSAGES' ? 'bg-[#f9a8d4] hover:bg-[#f472b6]' : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className="fas fa-comments text-[#db2777]"></i>
                                            <span>Messages</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="brutal-btn standard-unit-button stacked-action-button bg-white hover:bg-gray-50 text-[#060606]"
                                        >
                                            <i className="fas fa-user-lock text-[#f43f5e]"></i>
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Admin Actions */}
                            {isAuthenticated && adminUser && (
                                <div className="brutal-card left-panel-card left-panel-card-padding animate-fade-in bg-white">
                                    <h2 className="text-lg md:text-xl font-bold font-poppins text-[#060606] mb-5 truncate">Hi, {adminUser.name}</h2>
                                    <div className="standard-two-up-grid">
                                        <button
                                            onClick={() => setViewMode('ADMIN')}
                                            className={`brutal-btn standard-unit-button admin-action-button text-[#060606] ${
                                                viewMode === 'ADMIN' ? 'bg-[#38bdf8] hover:bg-[#0ea5e9]' : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className="fas fa-calendar-week"></i>
                                            <span>Schedule</span>
                                        </button>
                                        <button
                                            onClick={handleOpenAdminInventory}
                                            className={`brutal-btn standard-unit-button admin-action-button text-[#060606] ${
                                                viewMode === 'ADMIN_INVENTORY' ? 'bg-[#fef3c7] hover:bg-[#fde68a]' : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className="fas fa-boxes-stacked text-[#f97316]"></i>
                                            <span>Inventory</span>
                                        </button>
                                        <button
                                            onClick={handleOpenAdminPenHospital}
                                            className={`brutal-btn standard-unit-button admin-action-button text-[#060606] ${
                                                viewMode === 'ADMIN_PEN_HOSPITAL' ? 'bg-[#ccfbf1] hover:bg-[#99f6e4]' : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className="fas fa-suitcase-medical text-[#0f766e]"></i>
                                            <span>Pen Hospital</span>
                                        </button>
                                        <button
                                            onClick={handleOpenAdminPayroll}
                                            className={`brutal-btn standard-unit-button admin-action-button text-[#060606] ${
                                                viewMode === 'ADMIN_PAYROLL' ? 'bg-[#bbf7d0] hover:bg-[#86efac]' : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className="fas fa-file-invoice-dollar text-[#16a34a]"></i>
                                            <span>Payroll</span>
                                        </button>
                                        <button
                                            onClick={handleOpenAdminMessages}
                                            className={`brutal-btn standard-unit-button admin-action-button text-[#060606] ${
                                                viewMode === 'ADMIN_MESSAGES' ? 'bg-[#f9a8d4] hover:bg-[#f472b6]' : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className="fas fa-comments text-[#db2777]"></i>
                                            <span>Messages</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="brutal-btn standard-unit-button admin-action-button bg-white hover:bg-gray-50 text-[#060606]"
                                        >
                                            <i className="fas fa-user-lock text-[#f43f5e]"></i>
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Dynamic Panel */}
                        <div className={`right-panel transition-all duration-300 ${!selectedId && directoryMode === 'admin' && !isAdminWorkspaceOpen ? 'hidden lg:block' : 'block'}`}>
                            
                            {/* Adding relative positioning so absolute children (toast) anchor exactly here */}
                            <div className={`brutal-card ${isAdminWorkspaceOpen ? 'min-h-[520px] lg:h-[calc(100vh-220px)] lg:max-h-[860px]' : 'min-h-[400px] lg:h-[calc(100vh-220px)] lg:max-h-[800px]'} mb-4 md:mb-8 lg:sticky lg:top-8 flex flex-col relative overflow-hidden ${viewMode === 'EDIT' ? 'p-0' : 'panel-shell-padding'}`}>
                                
                                {/* TIMEOUT WARNING OVERLAY */}
                                {showTimeoutWarning && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                        <div className="brutal-card p-6 flex flex-col items-center bg-white shadow-[6px_6px_0px_0px_#000000] max-w-sm w-full mx-auto">
                                            <i className="fas fa-stopwatch text-4xl text-[#38bdf8] mb-4"></i>
                                            <h3 className="text-xl md:text-2xl font-bold font-poppins text-[#060606] mb-2 text-center">Need more time?</h3>
                                            <p className="text-[#060606] font-bold mb-6 text-center text-sm md:text-base">
                                                Session expires in <span className="text-[#f43f5e] text-xl ml-1">{timeoutCountdownSeconds}</span>s
                                            </p>
                                            <p className="card-meta text-center mb-4">
                                                {hasAcknowledgedTimeoutWarning
                                                    ? `Saying yes keeps you signed in and sets the next check to ${timeoutResetLabel} from now.`
                                                    : `The first check stays short. After you confirm once, the next check will be ${timeoutResetLabel} later.`}
                                            </p>
                                            <button 
                                                onClick={acknowledgeTimeoutWarning}
                                                className="brutal-btn bg-[#4ade80] hover:bg-[#22c55e] py-3 px-8 text-lg w-full flex items-center justify-center gap-2"
                                            >
                                                <i className="fas fa-check"></i> Yes, I'm still here
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!selectedId ? (
                                    directoryMode === 'admin' ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 animate-fade-in">
                                            <i className="fas fa-user-shield text-4xl md:text-6xl mb-4 md:mb-6 opacity-30 text-[#060606]"></i>
                                            <p className="font-bold font-poppins text-lg md:text-2xl text-[#060606] opacity-30">
                                                Select an admin account to continue
                                            </p>
                                        </div>
                                    ) : (
                                        <PublicOverviewPanel sheetData={sheetData} inventoryRows={inventoryRows} penHospitalCases={penHospitalCases} messages={messages} />
                                    )
                                ) : (
                                    <div className="flex-1 min-h-0 overflow-hidden">
                                        {viewMode === 'PINPAD' && <PinPad pinInput={pinInput} handlePinPress={handlePinPress} handlePinBackspace={handlePinBackspace} handlePinClear={handlePinClear} selectedEmployee={selectedUser} onCancel={handleSelectionCancel} />}
                                        {viewMode === 'TIMESHEET' && (
                                            <PersonalDashboard
                                                personalData={personalData}
                                                startEdit={startEdit}
                                                isFetchingLogs={isFetchingLogs}
                                                actionAlertPlan={actionAlertPlan}
                                                onClockAction={handleClockAction}
                                                canClockIn={canClockIn}
                                                canClockOut={canClockOut}
                                                isSubmittingAction={isSubmittingAction}
                                                roleLabel=""
                                            />
                                        )}
                                        {viewMode === 'SCHEDULE' && (
                                            <>
                                                <PublishedSchedulePanel
                                                    sheetData={sheetData}
                                                    eyebrow=""
                                                    title="Schedule"
                                                    highlightName={selectedEmployee?.name || ''}
                                                    allowTimeOffRequests={Boolean(selectedEmployee)}
                                                    onSelectDate={openEmployeeTimeOffRequest}
                                                    isSubmittingTimeOff={isSubmittingTimeOff}
                                                />
                                                <EmployeeTimeOffModal
                                                    employeeName={selectedEmployee?.name || ''}
                                                    draft={employeeTimeOffDraft}
                                                    setDraft={setEmployeeTimeOffDraft}
                                                    existingRow={activeEmployeeTimeOffRow}
                                                    onClose={closeEmployeeTimeOffRequest}
                                                    onSubmit={submitEmployeeTimeOffRequest}
                                                    isSubmitting={isSubmittingTimeOff}
                                                />
                                            </>
                                        )}
                                        {viewMode === 'INVENTORY' && (
                                            <EmployeeInventoryPanel
                                                inventoryRows={inventoryRows}
                                                isFetchingInventory={isFetchingInventory}
                                                isSubmittingInventory={isSubmittingInventory}
                                                onRefresh={() => refreshInventory({ showSpinner: true })}
                                                onStart={handleInventoryStart}
                                                onFinish={handleInventoryFinish}
                                                onMessage={setNotification}
                                            />
                                        )}
                                        {viewMode === 'PEN_HOSPITAL' && (
                                            <EmployeePenHospitalPanel
                                                penHospitalCases={penHospitalCases}
                                                currentUser={activeSessionUser}
                                                isFetchingPenHospital={isFetchingPenHospital}
                                                isSubmittingPenHospital={isSubmittingPenHospital}
                                                onRefresh={() => refreshPenHospital({ showSpinner: true })}
                                                onUpdateStatus={handleUpdatePenHospitalStatus}
                                            />
                                        )}
                                        {viewMode === 'MESSAGES' && (
                                            <MessageBoardPanel
                                                messages={messages}
                                                title="Messages"
                                                eyebrow=""
                                                subtitle="Leave updates about time off, inventory, supplies, or anything else the admin team should see."
                                                viewerName={activeMessageViewer?.name || ''}
                                                viewerRole={activeMessageViewer?.role || ''}
                                                draft={messageDraft}
                                                onDraftChange={setMessageDraft}
                                                onSend={submitMessage}
                                                onRefresh={() => refreshMessages({ showSpinner: true })}
                                                onReact={submitMessageReaction}
                                                canCompose={Boolean(activeMessageViewer)}
                                                isFetching={isFetchingMessages}
                                                isSubmitting={isSubmittingMessage}
                                                reactingRowNumber={reactingMessageRowNumber}
                                            />
                                        )}
                                        {viewMode === 'EDIT' && <EditForm editTarget={editTarget} editForm={editForm} setEditForm={setEditForm} saveEdit={saveEdit} reasonValidationTriggered={reasonValidationTriggered} onPrev={handleEditPrev} onNext={handleEditNext} canPrev={canEditPrev} canNext={canEditNext} onClose={() => { setReasonValidationTriggered(false); setViewMode('TIMESHEET'); }} isSubmitting={isSubmittingAction} />}
                                        {viewMode === 'ADMIN' && (
                                            <AdminScheduleWorkspace
                                                adminUser={adminUser}
                                                employees={employees}
                                                sheetData={sheetData}
                                                weekStart={adminWeekStart}
                                                onPrevWeek={() => setAdminWeekStart(prev => {
                                                    const next = new Date(prev);
                                                    next.setDate(next.getDate() - 7);
                                                    return next;
                                                })}
                                                onNextWeek={() => setAdminWeekStart(prev => {
                                                    const next = new Date(prev);
                                                    next.setDate(next.getDate() + 7);
                                                    return next;
                                                })}
                                                onJumpToWeek={jumpToAdminWeek}
                                                selectedCell={selectedAdminCell}
                                                onSelectCell={selectAdminCell}
                                                onCloseEditor={() => setSelectedAdminCell(null)}
                                                getCellDraft={getAdminScheduleDraft}
                                                updateCellDraft={updateAdminScheduleDraft}
                                                applyTemplateToCell={applyTemplateToAdminSchedule}
                                                shiftTemplates={settings.shiftTemplates}
                                                templateName={adminTemplateName}
                                                onTemplateNameChange={setAdminTemplateName}
                                                onSaveCurrentTemplate={saveSelectedShiftAsTemplate}
                                                savedWeekOptions={savedWeekOptions}
                                                saveWeekSchedules={saveAdminWeekSchedules}
                                                dirtyCount={stagedScheduleChangeCount}
                                                isRefreshing={isFetchingLogs}
                                                isSubmitting={isSubmittingAdminSchedule}
                                                isSubmittingTimeOff={isSubmittingTimeOff}
                                                isSavingTemplates={isSavingShiftTemplates}
                                                onApproveTimeOff={handleApproveTimeOff}
                                                onClearTimeOff={handleClearTimeOff}
                                            />
                                        )}
                                        {viewMode === 'ADMIN_INVENTORY' && (
                                            <AdminInventoryWorkspace
                                                adminUser={adminUser}
                                                inventoryRows={inventoryRows}
                                                isFetchingInventory={isFetchingInventory}
                                                isSubmittingInventory={isSubmittingInventory}
                                                onRefresh={() => refreshInventory({ showSpinner: true })}
                                                onAddNeed={handleInventoryAddNeed}
                                                onAdjustNeed={handleInventoryAdjustNeed}
                                                onApprove={handleInventoryApprove}
                                                onReject={handleInventoryRejectAwaiting}
                                                onOpenScheduler={() => setViewMode('ADMIN')}
                                                onMessage={setNotification}
                                            />
                                        )}
                                        {viewMode === 'ADMIN_PEN_HOSPITAL' && (
                                            <AdminPenHospitalWorkspace
                                                adminUser={adminUser}
                                                penHospitalCases={penHospitalCases}
                                                isFetchingPenHospital={isFetchingPenHospital}
                                                isSubmittingPenHospital={isSubmittingPenHospital}
                                                onRefresh={() => refreshPenHospital({ showSpinner: true })}
                                                onCreateCase={handleCreatePenHospitalCase}
                                                onUpdateStatus={handleUpdatePenHospitalStatus}
                                                onMessage={setNotification}
                                            />
                                        )}
                                        {viewMode === 'ADMIN_MESSAGES' && (
                                            <MessageBoardPanel
                                                messages={messages}
                                                title="Team Messages"
                                                eyebrow={formatRoleLabel(activeMessageViewer?.role || adminUser?.role, 'Admin')}
                                                subtitle="Review employee notes and reply in the same shared chat thread."
                                                viewerName={activeMessageViewer?.name || ''}
                                                viewerRole={activeMessageViewer?.role || ''}
                                                draft={messageDraft}
                                                onDraftChange={setMessageDraft}
                                                onSend={submitMessage}
                                                onRefresh={() => refreshMessages({ showSpinner: true })}
                                                onReact={submitMessageReaction}
                                                canCompose={Boolean(activeMessageViewer)}
                                                isFetching={isFetchingMessages}
                                                isSubmitting={isSubmittingMessage}
                                                reactingRowNumber={reactingMessageRowNumber}
                                            />
                                        )}
                                        {viewMode === 'ADMIN_PAYROLL' && (
                                            <AdminPayrollWorkspace
                                                adminUser={adminUser}
                                                employees={employees}
                                                sheetData={sheetData}
                                                isRefreshing={isFetchingLogs}
                                                onRefresh={() => refreshLogs({ showSpinner: true })}
                                            />
                                        )}
                                    </div>
                                )}
                                
                                {/* Notification Toast perfectly centered in the right panel */}
                                {notification && (
                                    <div className={`
                                        absolute bottom-6 md:bottom-10 left-0 right-0 mx-auto w-max max-w-[90%] px-6 py-3 md:px-8 md:py-4 rounded-xl border-3 border-black shadow-[6px_6px_0px_0px_#000000] text-[#060606] font-bold font-poppins text-sm md:text-lg flex items-center gap-3 animate-fade-in z-[60]
                                        ${notification.type === 'success' ? 'bg-[#a7f3d0]' : 
                                          notification.type === 'error' ? 'bg-[#fecdd3]' : 'bg-[#bae6fd]'}
                                    `}>
                                        <i className={`fas ${notification.type === 'success' ? 'fa-check-circle text-[#059669]' : 
                                                           notification.type === 'error' ? 'fa-exclamation-triangle text-[#e11d48]' : 'fa-info-circle text-[#38bdf8]'}`}></i>
                                        {notification.message}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
