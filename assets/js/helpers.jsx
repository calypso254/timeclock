const { useState, useEffect, useRef } = React;

        // --- HELPER FUNCTIONS ---
        
        const normalizeDate = (dStr) => {
            if (typeof dStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dStr)) {
                return dStr.substring(0, 10);
            }
            const d = new Date(dStr);
            if (isNaN(d)) return dStr;
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        // Helper to safely parse dates regardless of local YYYY-MM-DD or M/D/YYYY formatting
        const parseLocalDate = (dateValue) => {
            if (!dateValue) return new Date();

            if (dateValue instanceof Date) {
                return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
            }

            if (typeof dateValue === 'number') {
                const numericDate = new Date(dateValue);
                if (isNaN(numericDate.getTime())) return numericDate;
                return new Date(numericDate.getFullYear(), numericDate.getMonth(), numericDate.getDate());
            }

            const dateStr = String(dateValue).trim();
            const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (isoMatch) {
                return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
            }

            const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (slashMatch) {
                return new Date(parseInt(slashMatch[3], 10), parseInt(slashMatch[1], 10) - 1, parseInt(slashMatch[2], 10));
            }

            return new Date(dateStr);
        };

        const formatMonthDayDate = (dateStr) => {
            const dateObj = parseLocalDate(dateStr);
            if (isNaN(dateObj.getTime())) return '';
            return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        const formatFullDate = (dateStr) => {
            if (!dateStr) return '';
            const dateObj = parseLocalDate(dateStr);
            if (isNaN(dateObj.getTime())) return normalizeDate(dateStr);
            return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };

        const getWeekStartDate = (dateValue = new Date()) => {
            const dateObj = parseLocalDate(dateValue);
            const day = dateObj.getDay();
            const diff = dateObj.getDate() - day;
            return new Date(dateObj.getFullYear(), dateObj.getMonth(), diff);
        };

        const ADMIN_ROLES = ['admin', 'manager', 'owner'];
        const DEFAULT_ADMIN_SCHEDULE_STATUS = 'Draft';
        const TIME_OFF_STATUS = {
            REQUESTED: 'Time Off Requested',
            APPROVED: 'Time Off Approved',
        };
        const TIME_OFF_NOTE_KIND = 'time_off';
        const PAYROLL_PERIOD_ANCHOR = '2026-03-16';
        const PAYROLL_PERIOD_LENGTH_DAYS = 14;
        const PAYROLL_PAYDAY_OFFSET_DAYS = 5;
        const MESSAGE_MAX_LENGTH = 1000;
        const MESSAGE_REACTION_OPTIONS = [
            { key: 'thumbs_up', icon: 'fa-thumbs-up', label: 'Seen' },
            { key: 'heart', icon: 'fa-heart', label: 'Support' },
            { key: 'star', icon: 'fa-star', label: 'Important' },
        ];
        const PEN_HOSPITAL_STATUS = {
            DIAGNOSED: 'Diagnosed',
            ADMITTED: 'Admitted',
            IN_SURGERY: 'In Surgery',
            IN_RECOVERY: 'In Recovery',
            READY_FOR_RELEASE: 'Ready For Release',
            DISCHARGED: 'Discharged',
        };
        const PEN_HOSPITAL_STATUS_OPTIONS = [
            { value: PEN_HOSPITAL_STATUS.DIAGNOSED, label: 'Diagnosed' },
            { value: PEN_HOSPITAL_STATUS.ADMITTED, label: 'Admitted' },
            { value: PEN_HOSPITAL_STATUS.IN_SURGERY, label: 'In Surgery' },
            { value: PEN_HOSPITAL_STATUS.IN_RECOVERY, label: 'In Recovery' },
            { value: PEN_HOSPITAL_STATUS.READY_FOR_RELEASE, label: 'Ready For Release' },
            { value: PEN_HOSPITAL_STATUS.DISCHARGED, label: 'Discharged' },
        ];
        const PEN_HOSPITAL_BOARD_SECTIONS = [
            {
                key: 'inbound',
                title: 'Inbound',
                subtitle: 'Diagnosed and admitted returns waiting for surgery.',
                countClass: 'bg-[#ccfbf1]',
                cardClass: 'bg-[#f0fdfa]',
            },
            {
                key: 'in_process',
                title: 'In Process',
                subtitle: 'Pens actively moving through surgery and recovery.',
                countClass: 'bg-[#dbeafe]',
                cardClass: 'bg-[#eff6ff]',
            },
            {
                key: 'ready',
                title: 'Ready To Ship',
                subtitle: 'Repaired pens that are ready for release back to the customer.',
                countClass: 'bg-[#dcfce7]',
                cardClass: 'bg-[#f0fdf4]',
            },
            {
                key: 'completed',
                title: 'Discharged',
                subtitle: 'Completed repairs that have already gone back out.',
                countClass: 'bg-[#f3e8ff]',
                cardClass: 'bg-[#faf5ff]',
            },
        ];
        const STANDARD_SIZE_UNIT = 103;
        const STANDARD_SIZE_GAP = 16;

        const addDaysToLocalDate = (dateValue, dayCount) => {
            const dateObj = parseLocalDate(dateValue);
            const nextDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            nextDate.setDate(nextDate.getDate() + dayCount);
            return nextDate;
        };

        const buildWeekDays = (weekStart) => {
            return Array.from({ length: 7 }).map((_, index) => addDaysToLocalDate(weekStart, index));
        };

        const formatShortDateLabel = (dateValue) => {
            return parseLocalDate(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        const formatWeekRangeLabel = (weekStart) => {
            const weekDays = buildWeekDays(weekStart);
            return `${formatShortDateLabel(weekStart)} - ${formatShortDateLabel(weekDays[6])}`;
        };

        const getLocalDateDayStamp = (dateValue) => {
            const dateObj = parseLocalDate(dateValue);
            return Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        };

        const getPayrollPeriodStart = (dateValue = new Date()) => {
            const anchorStamp = getLocalDateDayStamp(PAYROLL_PERIOD_ANCHOR);
            const targetStamp = getLocalDateDayStamp(dateValue);
            const diffDays = Math.floor((targetStamp - anchorStamp) / 86400000);
            const periodIndex = Math.floor(diffDays / PAYROLL_PERIOD_LENGTH_DAYS);
            return addDaysToLocalDate(PAYROLL_PERIOD_ANCHOR, periodIndex * PAYROLL_PERIOD_LENGTH_DAYS);
        };

        const buildPayrollPeriodFromStart = (startDateValue) => {
            const startDate = parseLocalDate(startDateValue);
            const endDate = addDaysToLocalDate(startDate, PAYROLL_PERIOD_LENGTH_DAYS - 1);
            const payDate = addDaysToLocalDate(endDate, PAYROLL_PAYDAY_OFFSET_DAYS);
            return {
                key: normalizeDate(startDate),
                startDate,
                endDate,
                payDate,
                startKey: normalizeDate(startDate),
                endKey: normalizeDate(endDate),
                label: `${formatMonthDayDate(startDate)} - ${formatMonthDayDate(endDate)}`,
                fullLabel: `${formatFullDate(startDate)} - ${formatFullDate(endDate)}`,
            };
        };

        const isAdminRole = (role) => {
            return ADMIN_ROLES.includes(String(role || '').trim().toLowerCase());
        };

        const normalizeMessageRole = (role) => {
            const normalized = String(role || '').trim().toLowerCase();
            return isAdminRole(normalized) ? 'admin' : (normalized || 'employee');
        };

        const formatRoleLabel = (role, fallback = 'Employee') => {
            const normalized = String(role || '').trim();
            if (!normalized) return fallback;
            return normalized
                .split(/[\s_-]+/)
                .filter(Boolean)
                .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join(' ');
        };

        const isEmployeeActive = (employee) => {
            if (!employee) return false;
            if (typeof employee.active === 'boolean') return employee.active;
            const normalized = String(employee.active ?? '').trim().toLowerCase();
            if (!normalized) return true;
            return ['true', 'yes', 'y', '1', 'active'].includes(normalized);
        };

        const parseCurrencyNumber = (value) => {
            if (value === null || value === undefined || value === '') return null;
            if (typeof value === 'number' && Number.isFinite(value)) return value;
            const normalized = String(value).replace(/[^0-9.\-]/g, '');
            if (!normalized) return null;
            const parsed = Number.parseFloat(normalized);
            return Number.isFinite(parsed) ? parsed : null;
        };

        const formatCurrencyAmount = (value) => {
            const numericValue = parseCurrencyNumber(value);
            if (!Number.isFinite(numericValue)) return '';
            return numericValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            });
        };

        const getEmployeePayType = (employee) => {
            const normalized = String(
                employee?.payType
                || employee?.compensationType
                || employee?.wageType
                || ''
            ).trim().toLowerCase();
            return normalized === 'salary' ? 'salary' : 'hourly';
        };

        const getEmployeeHourlyWage = (employee) => {
            if (!employee || typeof employee !== 'object') return null;

            const candidates = [
                employee.hourlyWageValue,
                employee.hourlyWage,
                employee.wage,
                employee.payRate,
                employee.hourlyRate,
                employee.rate,
            ];

            for (const candidate of candidates) {
                const parsed = parseCurrencyNumber(candidate);
                if (Number.isFinite(parsed)) return parsed;
            }

            return null;
        };

        const buildEmployeeAdminDraft = (employee) => ({
            rowNumber: employee?.rowNumber || '',
            name: String(employee?.name || ''),
            jobTitle: String(employee?.jobTitle || employee?.department || ''),
            pin: String(employee?.pin || ''),
            role: String(employee?.role || 'employee'),
            active: isEmployeeActive(employee),
            payType: getEmployeePayType(employee),
            hourlyWage: (() => {
                const numericHourlyWage = getEmployeeHourlyWage(employee);
                if (Number.isFinite(numericHourlyWage)) return String(numericHourlyWage);
                return String(employee?.hourlyWage || '').trim();
            })(),
            phoneNumber: String(employee?.phoneNumber || ''),
            lastUpdate: String(employee?.lastUpdate || ''),
        });

        const buildEmptyEmployeeAdminDraft = () => ({
            rowNumber: '',
            name: '',
            jobTitle: '',
            pin: '',
            role: 'employee',
            active: true,
            payType: 'hourly',
            hourlyWage: '',
            phoneNumber: '',
            lastUpdate: '',
        });

        const getEmployeeDisplayOrderValue = (employee) => {
            const candidates = [
                employee?.displayOrder,
                employee?.sortOrder,
                employee?.order,
                employee?.position,
                employee?.rowNumber,
            ];

            for (const candidate of candidates) {
                const numericValue = Number(candidate);
                if (Number.isFinite(numericValue)) return numericValue;
            }

            return null;
        };

        const sortEmployeesForDisplay = (employeeList) => {
            return (Array.isArray(employeeList) ? employeeList : [])
                .map((employee, index) => ({
                    employee,
                    index,
                    orderValue: getEmployeeDisplayOrderValue(employee),
                }))
                .sort((a, b) => {
                    const aHasExplicitOrder = a.orderValue !== null;
                    const bHasExplicitOrder = b.orderValue !== null;

                    if (aHasExplicitOrder && bHasExplicitOrder && a.orderValue !== b.orderValue) {
                        return a.orderValue - b.orderValue;
                    }

                    if (aHasExplicitOrder !== bHasExplicitOrder) {
                        return aHasExplicitOrder ? -1 : 1;
                    }

                    return a.index - b.index;
                })
                .map(({ employee }) => employee);
        };

        const normalizeMessageText = (value) => {
            return String(value || '')
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .trim();
        };

        const normalizeMessageReactionKey = (value) => {
            const normalized = String(value || '').trim().toLowerCase();
            return MESSAGE_REACTION_OPTIONS.some(option => option.key === normalized) ? normalized : '';
        };

        const sanitizeMessageReactions = (value) => {
            if (!Array.isArray(value)) return [];
            const deduped = new Map();

            value.forEach(entry => {
                if (!entry || typeof entry !== 'object') return;
                const name = String(entry.name || entry.senderName || '').trim();
                const role = normalizeMessageRole(entry.role || entry.senderRole);
                const reaction = normalizeMessageReactionKey(entry.reaction || entry.key);
                const updatedAt = String(entry.updatedAt || entry.at || '').trim();
                if (!name || !reaction) return;
                deduped.set(`${name.toLowerCase()}|${role}`, { name, role, reaction, updatedAt });
            });

            return Array.from(deduped.values()).sort((a, b) => a.name.localeCompare(b.name));
        };

        const getMessageReactionSummary = (value) => {
            const reactions = sanitizeMessageReactions(value);
            return MESSAGE_REACTION_OPTIONS.map(option => {
                const matching = reactions.filter(entry => entry.reaction === option.key);
                if (matching.length === 0) return null;
                return {
                    ...option,
                    count: matching.length,
                    names: matching.map(entry => entry.name),
                };
            }).filter(Boolean);
        };

        const getViewerMessageReaction = (value, viewerName = '', viewerRole = '') => {
            const normalizedViewerName = String(viewerName || '').trim().toLowerCase();
            if (!normalizedViewerName) return '';

            const normalizedViewerRole = normalizeMessageRole(viewerRole || 'employee');
            const reactions = sanitizeMessageReactions(value);
            const match = reactions.find(entry =>
                entry.name.toLowerCase() === normalizedViewerName &&
                entry.role === normalizedViewerRole
            );
            return match?.reaction || '';
        };

        const isLikelyLegacyMessageResponse = (rows) => {
            if (!Array.isArray(rows) || rows.length === 0) return false;
            return rows.some(row =>
                row &&
                typeof row === 'object' &&
                !Array.isArray(row) &&
                'pin' in row &&
                'department' in row &&
                !('message' in row)
            );
        };

        const formatMessageTimestamp = (value, isoTimestamp = '') => {
            const candidate = isoTimestamp || value;
            if (!candidate) return '';
            const parsed = new Date(candidate);
            if (isNaN(parsed.getTime())) return String(value || '');
            return parsed.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            });
        };

        const normalizeAdminScheduleStatus = (value, fallback = DEFAULT_ADMIN_SCHEDULE_STATUS) => {
            const normalized = String(value || '').trim();
            return normalized || fallback;
        };

        const isTimeOffStatus = (value) => {
            const normalized = String(value || '').trim().toLowerCase();
            return normalized === TIME_OFF_STATUS.REQUESTED.toLowerCase() ||
                normalized === TIME_OFF_STATUS.APPROVED.toLowerCase();
        };

        const isTimeOffRequestedStatus = (value) => {
            return String(value || '').trim().toLowerCase() === TIME_OFF_STATUS.REQUESTED.toLowerCase();
        };

        const isTimeOffApprovedStatus = (value) => {
            return String(value || '').trim().toLowerCase() === TIME_OFF_STATUS.APPROVED.toLowerCase();
        };

        const buildEmptyAdminScheduleForm = (employeeName = '', dateValue = new Date()) => ({
            name: employeeName,
            date: normalizeDate(dateValue),
            schedIn: '',
            schedInPeriod: 'AM',
            schedOut: '',
            schedOutPeriod: 'PM',
            scheduleStatus: DEFAULT_ADMIN_SCHEDULE_STATUS,
            clearSchedule: false,
            sourceRow: null,
        });

        const buildEmptyAdminTemplateDraft = () => ({
            schedIn: '',
            schedInPeriod: 'AM',
            schedOut: '',
            schedOutPeriod: 'PM',
            scheduleStatus: DEFAULT_ADMIN_SCHEDULE_STATUS,
        });

        const hasTimeValue = (value) => {
            if (typeof value === 'string') {
                const normalized = value.trim().toLowerCase();
                return normalized !== '' && normalized !== '-' && normalized !== 'n/a';
            }
            return Boolean(value);
        };

        const normalizeClockTimeText = (value) => {
            if (value === null || value === undefined) return '';
            return String(value)
                .replace(/[\u00A0\u202F]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .toUpperCase();
        };

        const parseClockTimeToMinutes = (value) => {
            if (!hasTimeValue(value)) return null;
            const normalizedValue = normalizeClockTimeText(value);
            const match = normalizedValue.match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/);
            if (!match) return null;

            let hour = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            if (hour < 1 || hour > 12) return null;

            if (match[3] === 'AM') {
                if (hour === 12) hour = 0;
            } else if (hour !== 12) {
                hour += 12;
            }

            return (hour * 60) + minutes;
        };

        const normalizeTimeForComparison = (value) => {
            const parsedMinutes = parseClockTimeToMinutes(value);
            if (parsedMinutes !== null) return `m:${parsedMinutes}`;
            return normalizeClockTimeText(value);
        };

        const calculateWorkedMinutes = (start, end) => {
            const startMinutes = parseClockTimeToMinutes(start);
            const endMinutes = parseClockTimeToMinutes(end);
            if (startMinutes === null || endMinutes === null) return null;

            let diff = endMinutes - startMinutes;
            if (diff < 0) diff += 24 * 60;
            return diff;
        };

        const formatWorkedDurationForDisplay = (minutes) => {
            if (minutes === null || minutes === undefined) return "-";
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        };

        const formatWorkedDurationForSheet = (minutes) => {
            if (minutes === null || minutes === undefined) return '';
            return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
        };

        const formatDecimalHours = (minutes) => {
            if (minutes === null || minutes === undefined) return '';
            return (minutes / 60).toFixed(2);
        };

        const buildWorkedDurationFields = (timeIn, timeOut) => {
            const workedMinutes = calculateWorkedMinutes(timeIn, timeOut);
            if (workedMinutes === null) {
                return {
                    workedMinutes: '',
                    workedDuration: '',
                    workedDisplay: '',
                    decimalHours: '',
                };
            }

            return {
                workedMinutes,
                workedDuration: formatWorkedDurationForSheet(workedMinutes),
                workedDisplay: formatWorkedDurationForDisplay(workedMinutes),
                decimalHours: formatDecimalHours(workedMinutes),
            };
        };

        const MIDNIGHT_AUTO_CLOCK_OUT_TIME = '12:00 AM';

        const buildMidnightAutoClockOutMessage = (employeeName, row, { completed = false } = {}) => {
            const nameLabel = String(employeeName || 'This employee').trim() || 'This employee';
            const shiftDateLabel = formatFullDate(row?.date) || 'a prior day';

            if (completed) {
                return `The open shift for ${nameLabel} on ${shiftDateLabel} was auto clocked out at ${MIDNIGHT_AUTO_CLOCK_OUT_TIME}. Please edit that shift in My Timesheet if work continued past midnight.`;
            }

            return `The open shift for ${nameLabel} on ${shiftDateLabel} will auto clock out at ${MIDNIGHT_AUTO_CLOCK_OUT_TIME} so shifts do not continue past midnight. Please edit that shift in My Timesheet if work continued later.`;
        };

        const getMidnightAutoClockOutDetails = (rows, employeeName, localDate) => {
            if (!employeeName || !localDate) return null;

            const openShifts = getOpenShiftRowsForEmployee(rows, employeeName);
            const sameDayOpen = openShifts.filter(row => normalizeDate(row.date) === localDate);
            const olderOpen = openShifts.filter(row => normalizeDate(row.date) < localDate);
            const futureOpen = openShifts.filter(row => normalizeDate(row.date) > localDate);

            if (openShifts.length !== 1 || sameDayOpen.length > 0 || futureOpen.length > 0 || olderOpen.length !== 1) {
                return null;
            }

            const row = olderOpen[0];
            return {
                row,
                time: MIDNIGHT_AUTO_CLOCK_OUT_TIME,
                previewMessage: buildMidnightAutoClockOutMessage(employeeName, row),
                completedMessage: buildMidnightAutoClockOutMessage(employeeName, row, { completed: true }),
            };
        };

        const calculateHours = (start, end) => {
            const workedMinutes = calculateWorkedMinutes(start, end);
            return workedMinutes === null ? "-" : formatWorkedDurationForDisplay(workedMinutes);
        };

        const isPublishedSchedule = (row) => {
            return String(row?.scheduleStatus || '').trim().toLowerCase() === 'published';
        };

        const filterTimesheetRowsUpToToday = (rows) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return rows.filter(row => {
                if (isTimeOffRow(row)) return false;
                if (!(row.timeIn || isPublishedSchedule(row))) return false;
                const rowDate = parseLocalDate(row.date);
                if (isNaN(rowDate.getTime())) return false;
                rowDate.setHours(0, 0, 0, 0);
                return rowDate <= today;
            });
        };

        const isSameTimesheetEntry = (a, b) => {
            if (!a || !b) return false;
            return (
                a.name === b.name &&
                normalizeDate(a.date) === normalizeDate(b.date) &&
                normalizeTimeForComparison(a.timeIn || '') === normalizeTimeForComparison(b.timeIn || '') &&
                normalizeTimeForComparison(a.timeOut || '') === normalizeTimeForComparison(b.timeOut || '')
            );
        };

        const isEntryLocked = (row) => {
            return String(row?.payrollStatus || '').trim().toLowerCase() === 'locked';
        };

        const parseTimeOffMetadata = (reasonText) => {
            if (!reasonText || typeof reasonText !== 'string') return null;
            const trimmed = reasonText.trim();
            if (!trimmed) return null;

            try {
                const parsed = JSON.parse(trimmed);
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || parsed.kind !== TIME_OFF_NOTE_KIND) {
                    return null;
                }

                return {
                    kind: TIME_OFF_NOTE_KIND,
                    fullDay: parsed.fullDay === true,
                    requestedBy: String(parsed.requestedBy || '').trim(),
                    requestedAt: String(parsed.requestedAt || '').trim(),
                    updatedAt: String(parsed.updatedAt || '').trim(),
                    approvedBy: String(parsed.approvedBy || '').trim(),
                    approvedAt: String(parsed.approvedAt || '').trim(),
                };
            } catch (_) {
                return null;
            }
        };

        const isTimeOffRow = (row) => {
            if (!row) return false;
            return isTimeOffStatus(row.scheduleStatus) || Boolean(parseTimeOffMetadata(row.reason));
        };

        const isTimeOffRequestRow = (row) => {
            return isTimeOffRequestedStatus(row?.scheduleStatus);
        };

        const isApprovedTimeOffRow = (row) => {
            return isTimeOffApprovedStatus(row?.scheduleStatus);
        };

        const resolveTimeOffFullDay = (row, metadata = parseTimeOffMetadata(row?.reason)) => {
            if (metadata?.fullDay) return true;
            return !hasTimeValue(row?.schedIn) && !hasTimeValue(row?.schedOut);
        };

        const getTimeOffRangeLabel = (row, metadata = parseTimeOffMetadata(row?.reason)) => {
            if (!row) return '';
            if (resolveTimeOffFullDay(row, metadata)) return 'Full day';
            if (hasTimeValue(row.schedIn) && hasTimeValue(row.schedOut)) {
                return `${row.schedIn} - ${row.schedOut}`;
            }
            return 'Hours requested';
        };

        const getTimeOffStatusLabel = (row) => {
            if (isApprovedTimeOffRow(row)) return 'Approved';
            if (isTimeOffRequestRow(row)) return 'Requested';
            return 'Time Off';
        };

        const getTimeOffRowForEmployeeDate = (rows, employeeName, dateValue) => {
            const targetDate = normalizeDate(dateValue);
            const candidates = getEmployeeRows(rows, employeeName).filter(row =>
                normalizeDate(row.date) === targetDate &&
                !isEntryLocked(row) &&
                isTimeOffRow(row)
            );

            if (candidates.length === 0) return null;
            return candidates.find(isApprovedTimeOffRow) ||
                candidates.find(isTimeOffRequestRow) ||
                candidates[0];
        };

        const isPastScheduleDate = (dateValue) => {
            return normalizeDate(dateValue) < normalizeDate(new Date());
        };

        const isPayrollRelevantRow = (row) => {
            if (!row) return false;
            if (hasTimeValue(row.decimalHours) || hasTimeValue(row.totalHours)) return true;
            return hasTimeValue(row.timeIn) || hasTimeValue(row.timeOut);
        };

        const getPayrollRowMinutes = (row) => {
            if (!row) return 0;
            const decimalValue = Number.parseFloat(String(row.decimalHours || '').trim());
            if (Number.isFinite(decimalValue) && decimalValue > 0) {
                return Math.round(decimalValue * 60);
            }

            const workedMinutes = calculateWorkedMinutes(row.timeIn, row.timeOut);
            return workedMinutes === null ? 0 : workedMinutes;
        };

        const formatPayrollHours = (minutes) => {
            if (!minutes) return '0.00';
            return (minutes / 60).toFixed(2);
        };

        const getEmployeeRows = (rows, employeeName) => {
            if (!employeeName) return [];
            return rows.filter(row => row.name === employeeName);
        };

        const getOpenShiftRowsForEmployee = (rows, employeeName) => {
            return getEmployeeRows(rows, employeeName)
                .filter(row => !isTimeOffRow(row) && hasTimeValue(row.timeIn) && !hasTimeValue(row.timeOut) && !isEntryLocked(row))
                .slice()
                .sort((a, b) => normalizeDate(a.date).localeCompare(normalizeDate(b.date)));
        };

        const listShiftDates = (rows) => {
            return [...new Set((rows || []).map(row => formatFullDate(row.date)).filter(Boolean))].join(', ');
        };

        const buildRowFingerprint = (row) => {
            if (!row) return '';
            return JSON.stringify({
                date: normalizeDate(row.date),
                name: row.name || '',
                timeIn: row.timeIn || '',
                timeOut: row.timeOut || '',
                schedIn: row.schedIn || '',
                schedOut: row.schedOut || '',
                payrollStatus: row.payrollStatus || '',
                scheduleStatus: row.scheduleStatus || '',
            });
        };

        const buildRowContextPayload = (row) => {
            if (!row) {
                return {
                    targetRowDate: '',
                    targetRowKey: '',
                    targetRowTimeIn: '',
                    targetRowTimeOut: '',
                    targetRowSchedIn: '',
                    targetRowSchedOut: '',
                    targetRowPayrollStatus: '',
                    targetRowScheduleStatus: '',
                };
            }

            return {
                targetRowDate: normalizeDate(row.date),
                targetRowKey: buildRowFingerprint(row),
                targetRowTimeIn: row.timeIn || '',
                targetRowTimeOut: row.timeOut || '',
                targetRowSchedIn: row.schedIn || '',
                targetRowSchedOut: row.schedOut || '',
                targetRowPayrollStatus: row.payrollStatus || '',
                targetRowScheduleStatus: row.scheduleStatus || '',
            };
        };

        const buildActionTimestamp = (now = new Date()) => {
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return {
                localDate: `${year}-${month}-${day}`,
                localTime: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                isoTimestamp: now.toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
                timezoneOffsetMinutes: now.getTimezoneOffset(),
            };
        };

        const parseWholeNumber = (value, { allowNegative = false } = {}) => {
            if (value === null || value === undefined) return null;
            const trimmed = String(value).trim();
            if (!trimmed) return null;
            if (!/^[+-]?\d+$/.test(trimmed)) return null;
            const parsed = Number(trimmed);
            if (!Number.isFinite(parsed)) return null;
            if (allowNegative) return parsed === 0 ? null : parsed;
            return parsed > 0 ? parsed : null;
        };

        const getInventoryStatusWeight = (status) => {
            switch (String(status || '').trim()) {
                case 'Awaiting Approval':
                    return 0;
                case 'In Process':
                    return 1;
                case 'Open':
                    return 2;
                case 'Completed':
                case 'Complete':
                    return 3;
                default:
                    return 4;
            }
        };

        const sortInventoryRows = (rows) => {
            return (Array.isArray(rows) ? rows : []).slice().sort((a, b) => {
                const statusDelta = getInventoryStatusWeight(a?.status) - getInventoryStatusWeight(b?.status);
                if (statusDelta !== 0) return statusDelta;
                return (b?.rowNumber || 0) - (a?.rowNumber || 0);
            });
        };

        const getOpenInventoryRows = (rows) => {
            return (Array.isArray(rows) ? rows : []).filter(row => (
                Number(row?.stillNeeded || 0) > 0 ||
                Number(row?.inProcess || 0) > 0 ||
                Number(row?.awaitingApproval || 0) > 0
            ));
        };

        const formatInventoryTimestamp = (value) => {
            return value ? String(value) : 'Not yet updated';
        };

        const normalizePenHospitalStatus = (value) => {
            const normalized = String(value || '').trim().toLowerCase();
            const match = PEN_HOSPITAL_STATUS_OPTIONS.find(option => option.value.toLowerCase() === normalized);
            return match?.value || PEN_HOSPITAL_STATUS.DIAGNOSED;
        };

        const getPenHospitalStatusWeight = (status) => {
            switch (normalizePenHospitalStatus(status)) {
                case PEN_HOSPITAL_STATUS.DIAGNOSED:
                    return 0;
                case PEN_HOSPITAL_STATUS.ADMITTED:
                    return 1;
                case PEN_HOSPITAL_STATUS.IN_SURGERY:
                    return 2;
                case PEN_HOSPITAL_STATUS.IN_RECOVERY:
                    return 3;
                case PEN_HOSPITAL_STATUS.READY_FOR_RELEASE:
                    return 4;
                case PEN_HOSPITAL_STATUS.DISCHARGED:
                    return 5;
                default:
                    return 6;
            }
        };

        const getPenHospitalBoardKey = (status) => {
            switch (normalizePenHospitalStatus(status)) {
                case PEN_HOSPITAL_STATUS.DIAGNOSED:
                case PEN_HOSPITAL_STATUS.ADMITTED:
                    return 'inbound';
                case PEN_HOSPITAL_STATUS.IN_SURGERY:
                case PEN_HOSPITAL_STATUS.IN_RECOVERY:
                    return 'in_process';
                case PEN_HOSPITAL_STATUS.READY_FOR_RELEASE:
                    return 'ready';
                case PEN_HOSPITAL_STATUS.DISCHARGED:
                    return 'completed';
                default:
                    return 'inbound';
            }
        };

        const sortPenHospitalCases = (cases) => {
            return (Array.isArray(cases) ? cases : []).slice().sort((a, b) => {
                const statusDelta = getPenHospitalStatusWeight(a?.status) - getPenHospitalStatusWeight(b?.status);
                if (statusDelta !== 0) return statusDelta;

                const aTime = new Date(a?.lastUpdatedIso || a?.lastUpdated || a?.createdAtIso || a?.createdAt || 0).getTime();
                const bTime = new Date(b?.lastUpdatedIso || b?.lastUpdated || b?.createdAtIso || b?.createdAt || 0).getTime();
                if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
                    return bTime - aTime;
                }

                return (b?.rowNumber || 0) - (a?.rowNumber || 0);
            });
        };

        const buildPenHospitalSummary = (cases) => {
            const safeCases = Array.isArray(cases) ? cases : [];
            return PEN_HOSPITAL_BOARD_SECTIONS.map(section => ({
                ...section,
                count: safeCases.filter(caseRow => getPenHospitalBoardKey(caseRow?.status) === section.key).length,
            }));
        };

        const formatPenHospitalTimestamp = (value, isoTimestamp = '') => {
            return formatMessageTimestamp(value, isoTimestamp) || 'Not yet updated';
        };

        const canUserSetPenHospitalStatus = (role, nextStatus) => {
            const normalizedStatus = normalizePenHospitalStatus(nextStatus);
            if (isAdminRole(role)) return true;
            return normalizedStatus !== PEN_HOSPITAL_STATUS.DIAGNOSED &&
                normalizedStatus !== PEN_HOSPITAL_STATUS.DISCHARGED;
        };

        const getPenHospitalStatusChipClasses = (status) => {
            switch (normalizePenHospitalStatus(status)) {
                case PEN_HOSPITAL_STATUS.DIAGNOSED:
                    return 'bg-[#fde68a]';
                case PEN_HOSPITAL_STATUS.ADMITTED:
                    return 'bg-[#ccfbf1]';
                case PEN_HOSPITAL_STATUS.IN_SURGERY:
                    return 'bg-[#bfdbfe]';
                case PEN_HOSPITAL_STATUS.IN_RECOVERY:
                    return 'bg-[#ddd6fe]';
                case PEN_HOSPITAL_STATUS.READY_FOR_RELEASE:
                    return 'bg-[#bbf7d0]';
                case PEN_HOSPITAL_STATUS.DISCHARGED:
                    return 'bg-[#f5d0fe]';
                default:
                    return 'bg-[#f3f4f6]';
            }
        };

        const formatPenHospitalExpectedLabel = (caseRow) => {
            const expectedCount = Number(caseRow?.expectedCount || 0);
            if (!expectedCount) return 'No expected pen count';
            return `${expectedCount} pen${expectedCount === 1 ? '' : 's'} expected`;
        };

        const getTodayPublishedShifts = (sheetData) => {
            const todayKey = normalizeDate(new Date());
            return (Array.isArray(sheetData) ? sheetData : [])
                .filter(row =>
                    !isTimeOffRow(row) &&
                    normalizeDate(row?.date) === todayKey &&
                    (hasTimeValue(row?.schedIn) || hasTimeValue(row?.schedOut)) &&
                    isPublishedSchedule(row)
                )
                .slice()
                .sort((a, b) => {
                    const timeCompare = (parseClockTimeToMinutes(a.schedIn) || 0) - (parseClockTimeToMinutes(b.schedIn) || 0);
                    if (timeCompare !== 0) return timeCompare;
                    return String(a.name || '').localeCompare(String(b.name || ''));
                });
        };

        const buildInventorySnapshotSummary = (rows) => {
            const openRows = sortInventoryRows(getOpenInventoryRows(rows));
            const totals = openRows.reduce((acc, row) => {
                acc.stillNeeded += Number(row?.stillNeeded || 0);
                acc.inProcess += Number(row?.inProcess || 0);
                acc.awaitingApproval += Number(row?.awaitingApproval || 0);
                return acc;
            }, {
                stillNeeded: 0,
                inProcess: 0,
                awaitingApproval: 0,
            });

            return { openRows, totals };
        };

        const getInventorySkuText = (row) => {
            return String(row?.sku || '').trim() || 'No SKU';
        };

        const getInventoryNameText = (row) => {
            return String(row?.product || '').trim() || 'No name entered';
        };

        const applySuccessfulPunchLocally = (rows, actionType, employeeName, timestamp, plan, reason = '') => {
            const safeRows = Array.isArray(rows) ? rows.slice() : [];

            if (actionType === 'CLOCK_IN') {
                if (!plan?.row) {
                    return [{
                        date: timestamp.localDate,
                        name: employeeName,
                        schedIn: '',
                        schedOut: '',
                        timeIn: timestamp.localTime,
                        timeOut: '',
                        reason,
                        payrollStatus: 'Open',
                        scheduleStatus: '',
                    }, ...safeRows];
                }

                return safeRows.map(row => (
                    isSameTimesheetEntry(row, plan.row)
                        ? { ...row, timeIn: timestamp.localTime, reason: reason || row.reason || '' }
                        : row
                ));
            }

            if (!plan?.row) {
                return safeRows;
            }

            return safeRows.map(row => (
                isSameTimesheetEntry(row, plan.row)
                    ? { ...row, timeOut: timestamp.localTime }
                    : row
            ));
        };

        const getExpectedActionRow = (rows, actionType, employeeName, timestamp, plan) => {
            if (!Array.isArray(rows)) return null;

            if (actionType === 'CLOCK_IN') {
                return rows.find(row =>
                    row.name === employeeName &&
                    normalizeDate(row.date) === timestamp.localDate &&
                    normalizeTimeForComparison(row.timeIn || '') === normalizeTimeForComparison(timestamp.localTime)
                ) || null;
            }

            return rows.find(row =>
                row.name === employeeName &&
                normalizeDate(row.date) === timestamp.localDate &&
                normalizeTimeForComparison(row.timeOut || '') === normalizeTimeForComparison(timestamp.localTime) &&
                (!plan?.row?.timeIn || normalizeTimeForComparison(row.timeIn || '') === normalizeTimeForComparison(plan.row.timeIn || ''))
            ) || null;
        };

        const getExpectedScheduleRow = (rows, payload) => {
            if (!Array.isArray(rows) || !payload) return null;

            return rows.find(row =>
                !isTimeOffRow(row) &&
                row.name === payload.name &&
                normalizeDate(row.date) === payload.date &&
                normalizeTimeForComparison(row.schedIn || '') === normalizeTimeForComparison(payload.schedIn || '') &&
                normalizeTimeForComparison(row.schedOut || '') === normalizeTimeForComparison(payload.schedOut || '') &&
                String(row.scheduleStatus || '').trim() === String(payload.scheduleStatus || '').trim()
            ) || null;
        };

        const getLateStartNote = (scheduledIn, actualTime) => {
            const scheduledMinutes = parseClockTimeToMinutes(scheduledIn);
            const actualMinutes = parseClockTimeToMinutes(actualTime);
            if (scheduledMinutes === null || actualMinutes === null) return '';
            return (actualMinutes - scheduledMinutes) > 5 ? 'Late Start' : '';
        };

        const resolveClockInPlan = (rows, employeeName, localDate) => {
            const approvedTimeOffRow = getTimeOffRowForEmployeeDate(rows, employeeName, localDate);
            if (isApprovedTimeOffRow(approvedTimeOffRow)) {
                return {
                    status: 'blocked',
                    code: 'approved-time-off',
                    message: `${employeeName} has approved time off for ${formatFullDate(localDate)} (${getTimeOffRangeLabel(approvedTimeOffRow)}).`,
                    rows: [approvedTimeOffRow],
                };
            }

            const openShifts = getOpenShiftRowsForEmployee(rows, employeeName);
            const sameDayOpen = openShifts.filter(row => normalizeDate(row.date) === localDate);
            const olderOpen = openShifts.filter(row => normalizeDate(row.date) < localDate);
            const futureOpen = openShifts.filter(row => normalizeDate(row.date) > localDate);
            const autoClockOut = getMidnightAutoClockOutDetails(rows, employeeName, localDate);
            const withAutoClockOut = (plan) => autoClockOut ? { ...plan, autoClockOut } : plan;

            if (sameDayOpen.length === 1 && openShifts.length === 1) {
                return withAutoClockOut({
                    status: 'blocked',
                    code: 'already-clocked-in',
                    message: `${employeeName} is already clocked in for ${formatFullDate(localDate)}.`,
                    rows: sameDayOpen,
                });
            }

            if (openShifts.length > 1 || sameDayOpen.length > 1) {
                return withAutoClockOut({
                    status: 'blocked',
                    code: 'multiple-open-shifts',
                    message: `Automatic clock actions are paused because ${employeeName} has multiple open shifts (${listShiftDates(openShifts)}). Fix those entries in My Timesheet first so a new punch cannot land on the wrong row.`,
                    rows: openShifts,
                });
            }

            if (olderOpen.length > 0 && !autoClockOut) {
                return withAutoClockOut({
                    status: 'blocked',
                    code: 'prior-open-shift',
                    message: `Automatic clock actions are paused because ${employeeName} still has an open shift from ${formatFullDate(olderOpen[0].date)}. Add the missing clock-out on that row before recording a new punch.`,
                    rows: olderOpen,
                });
            }

            if (futureOpen.length > 0) {
                return withAutoClockOut({
                    status: 'blocked',
                    code: 'future-open-shift',
                    message: `Automatic clock actions are paused because there is an open shift dated ${formatFullDate(futureOpen[0].date)}. Please correct that row before recording a new punch.`,
                    rows: futureOpen,
                });
            }

            const candidates = getEmployeeRows(rows, employeeName).filter(row =>
                normalizeDate(row.date) === localDate &&
                !isTimeOffRow(row) &&
                !hasTimeValue(row.timeIn) &&
                !hasTimeValue(row.timeOut) &&
                !isEntryLocked(row)
            );

            if (candidates.length === 0) {
                return withAutoClockOut({ status: 'ready', code: 'new-row', row: null });
            }

            if (candidates.length === 1) {
                return withAutoClockOut({ status: 'ready', code: 'existing-row', row: candidates[0] });
            }

            const scheduledCandidates = candidates.filter(row => hasTimeValue(row.schedIn) || hasTimeValue(row.schedOut));
            if (scheduledCandidates.length === 1) {
                return withAutoClockOut({ status: 'ready', code: 'existing-row', row: scheduledCandidates[0] });
            }

            return withAutoClockOut({
                status: 'blocked',
                code: 'ambiguous-clock-in-row',
                message: `Automatic clock-in is paused because there are multiple blank rows for ${formatFullDate(localDate)}. Please have a manager review today's schedule row before punching in.`,
                rows: candidates,
            });
        };

        const hasOpenShiftForToday = (rows, employeeName) => {
            if (!employeeName) return false;
            const todayKey = normalizeDate(new Date());
            return getOpenShiftRowsForEmployee(rows, employeeName).some(row => normalizeDate(row.date) === todayKey);
        };

        const resolveClockOutPlan = (rows, employeeName, localDate) => {
            const approvedTimeOffRow = getTimeOffRowForEmployeeDate(rows, employeeName, localDate);
            const openShifts = getOpenShiftRowsForEmployee(rows, employeeName);
            const sameDayOpen = openShifts.filter(row => normalizeDate(row.date) === localDate);
            const olderOpen = openShifts.filter(row => normalizeDate(row.date) < localDate);
            const futureOpen = openShifts.filter(row => normalizeDate(row.date) > localDate);

            if (sameDayOpen.length === 1 && openShifts.length === 1) {
                return { status: 'ready', code: 'exact-open-shift', row: sameDayOpen[0] };
            }

            if (openShifts.length === 0) {
                if (isApprovedTimeOffRow(approvedTimeOffRow)) {
                    return {
                        status: 'blocked',
                        code: 'approved-time-off',
                        message: `${employeeName} has approved time off for ${formatFullDate(localDate)} (${getTimeOffRangeLabel(approvedTimeOffRow)}).`,
                        rows: [approvedTimeOffRow],
                    };
                }
                return {
                    status: 'blocked',
                    code: 'no-open-shift',
                    message: `No open shift was found for ${formatFullDate(localDate)}.`,
                    rows: [],
                };
            }

            if (sameDayOpen.length > 1 || openShifts.length > 1) {
                return {
                    status: 'blocked',
                    code: 'multiple-open-shifts',
                    message: `Automatic clock-out is paused because ${employeeName} has multiple open shifts (${listShiftDates(openShifts)}). This keeps a clock-out from being saved on the wrong day.`,
                    rows: openShifts,
                };
            }

            if (olderOpen.length === 1 && sameDayOpen.length === 0) {
                return {
                    status: 'blocked',
                    code: 'prior-open-shift',
                    message: `Automatic clock-out is paused because the only open shift for ${employeeName} is on ${formatFullDate(olderOpen[0].date)}. Correct that row in My Timesheet instead of clocking out on today's screen.`,
                    rows: olderOpen,
                };
            }

            if (futureOpen.length === 1 && sameDayOpen.length === 0) {
                return {
                    status: 'blocked',
                    code: 'future-open-shift',
                    message: `Automatic clock-out is paused because the only open shift for ${employeeName} is dated ${formatFullDate(futureOpen[0].date)}. Correct that row before recording another punch.`,
                    rows: futureOpen,
                };
            }

            return {
                status: 'blocked',
                code: 'ambiguous-clock-out-row',
                message: `Automatic clock-out is paused because the open shift could not be matched to ${formatFullDate(localDate)}.`,
                rows: openShifts,
            };
        };

        const normalizeTimeInputWithPeriod = (value, currentPeriod = '') => {
            const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
            if (digits.length === 0) return { time: '', period: currentPeriod };
            if (digits.length <= 2) return { time: digits, period: currentPeriod };
            if (digits.length === 3) return { time: `${digits.slice(0, 1)}:${digits.slice(1)}`, period: currentPeriod };

            const hour24 = parseInt(digits.slice(0, 2), 10);
            const minutes = digits.slice(2);
            if (!isNaN(hour24) && hour24 >= 0 && hour24 <= 23) {
                const period = hour24 >= 12 ? 'PM' : 'AM';
                const hour12 = (hour24 % 12) || 12;
                return { time: `${hour12}:${minutes}`, period };
            }
            return { time: `${digits.slice(0, 2)}:${minutes}`, period: currentPeriod };
        };

        const parseTimeField = (value) => {
            if (!value || typeof value !== 'string') {
                return { time: '', period: '' };
            }
            const match = normalizeClockTimeText(value).match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/);
            if (!match) {
                return { time: '', period: '' };
            }
            const hour = parseInt(match[1], 10);
            if (hour < 1 || hour > 12) {
                return { time: '', period: '' };
            }
            return { time: `${hour}:${match[2]}`, period: match[3] };
        };

        const formatTimeField = (timeValue, periodValue) => {
            const cleanedTime = String(timeValue || '').trim();
            if (!cleanedTime) return '';
            const match = cleanedTime.match(/^(\d{1,2}):([0-5]\d)$/);
            const period = String(periodValue || '').toUpperCase();
            if (!match || (period !== 'AM' && period !== 'PM')) return null;
            const hour = parseInt(match[1], 10);
            if (hour < 1 || hour > 12) return null;
            return `${hour}:${match[2]} ${period}`;
        };

        const buildEmptyTimeOffRequestDraft = (dateValue = new Date()) => ({
            date: normalizeDate(dateValue),
            fullDay: true,
            schedIn: '',
            schedInPeriod: 'AM',
            schedOut: '',
            schedOutPeriod: 'PM',
            sourceRow: null,
        });

        const buildTimeOffRequestDraftFromRow = (row, dateValue = new Date()) => {
            const metadata = parseTimeOffMetadata(row?.reason);
            const parsedIn = parseTimeField(row?.schedIn || '');
            const parsedOut = parseTimeField(row?.schedOut || '');
            return {
                ...buildEmptyTimeOffRequestDraft(dateValue || row?.date || new Date()),
                fullDay: resolveTimeOffFullDay(row, metadata),
                schedIn: parsedIn.time,
                schedInPeriod: parsedIn.period || 'AM',
                schedOut: parsedOut.time,
                schedOutPeriod: parsedOut.period || 'PM',
                sourceRow: row || null,
            };
        };

        const formatTimeOffDraftRange = (draft) => {
            if (!draft) return '';
            if (draft.fullDay) return 'Full day';
            const formattedIn = formatTimeField(draft.schedIn, draft.schedInPeriod);
            const formattedOut = formatTimeField(draft.schedOut, draft.schedOutPeriod);
            if (!formattedIn || !formattedOut) return '';
            return `${formattedIn} - ${formattedOut}`;
        };

        const ADMIN_SHIFT_TEMPLATE_ACCENTS = [
            'bg-[#bfdbfe]',
            'bg-[#fde68a]',
            'bg-[#fecdd3]',
            'bg-[#bbf7d0]',
            'bg-[#ddd6fe]',
            'bg-[#fdba74]',
        ];

        const ADMIN_SHIFT_UTILITY_TEMPLATE = {
            id: 'clear-cell',
            label: 'Remove Shift',
            schedIn: '',
            schedOut: '',
            scheduleStatus: '',
            clearSchedule: true,
            accent: 'bg-[#f8fafc]',
            isBuiltIn: true,
        };

        const buildShiftTemplateId = (label = 'template') => {
            return `template-${String(label || 'template')
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') || 'template'}-${Date.now()}`;
        };

        const normalizeAdminShiftTemplate = (template, index = 0) => {
            if (!template || typeof template !== 'object') return null;

            const label = String(template.label || '').trim();
            if (!label) return null;

            const parsedIn = parseTimeField(template.schedIn || '');
            const parsedOut = parseTimeField(template.schedOut || '');
            const schedIn = formatTimeField(parsedIn.time, parsedIn.period);
            const schedOut = formatTimeField(parsedOut.time, parsedOut.period);

            if (!schedIn || !schedOut) return null;

            return {
                id: String(template.id || `${buildShiftTemplateId(label)}-${index}`),
                label,
                schedIn,
                schedOut,
                scheduleStatus: normalizeAdminScheduleStatus(template.scheduleStatus),
                accent: ADMIN_SHIFT_TEMPLATE_ACCENTS[index % ADMIN_SHIFT_TEMPLATE_ACCENTS.length],
                clearSchedule: false,
            };
        };

        const normalizeAdminShiftTemplates = (templates) => {
            const seenIds = new Set();
            return (Array.isArray(templates) ? templates : [])
                .map((template, index) => normalizeAdminShiftTemplate(template, index))
                .filter(template => {
                    if (!template || seenIds.has(template.id)) return false;
                    seenIds.add(template.id);
                    return true;
                });
        };

        const getVisibleAdminShiftTemplates = (templates) => {
            return normalizeAdminShiftTemplates(templates);
        };

        const buildScheduleCellKey = (employeeName, dateValue) => {
            return `${normalizeDate(dateValue)}::${String(employeeName || '').trim()}`;
        };

        const getScheduleRowForEmployeeDate = (rows, employeeName, dateValue) => {
            const targetDate = normalizeDate(dateValue);
            const candidates = getEmployeeRows(rows, employeeName).filter(row =>
                normalizeDate(row.date) === targetDate &&
                !isEntryLocked(row) &&
                !isTimeOffRow(row)
            );

            if (candidates.length === 0) return null;
            return candidates.find(row => hasTimeValue(row.schedIn) || hasTimeValue(row.schedOut)) ||
                candidates.find(row => !hasTimeValue(row.timeIn) && !hasTimeValue(row.timeOut)) ||
                candidates[0];
        };

        const getSavedScheduleRowForEmployeeDate = (rows, employeeName, dateValue) => {
            const targetDate = normalizeDate(dateValue);
            const candidates = getEmployeeRows(rows, employeeName).filter(row =>
                normalizeDate(row.date) === targetDate &&
                !isTimeOffRow(row)
            );

            if (candidates.length === 0) return null;
            return candidates.find(row => hasTimeValue(row.schedIn) || hasTimeValue(row.schedOut)) ||
                candidates.find(row => !hasTimeValue(row.timeIn) && !hasTimeValue(row.timeOut)) ||
                candidates[0];
        };

        const buildAdminScheduleDraftFromRow = (row, employeeName = '', dateValue = new Date()) => {
            const parsedIn = parseTimeField(row?.schedIn || '');
            const parsedOut = parseTimeField(row?.schedOut || '');
            return {
                ...buildEmptyAdminScheduleForm(employeeName || row?.name || '', dateValue || row?.date || new Date()),
                schedIn: parsedIn.time,
                schedInPeriod: parsedIn.period || 'AM',
                schedOut: parsedOut.time,
                schedOutPeriod: parsedOut.period || 'PM',
                scheduleStatus: normalizeAdminScheduleStatus(row?.scheduleStatus),
                clearSchedule: false,
                sourceRow: row || null,
            };
        };

        const normalizeAdminScheduleDraftForComparison = (draft) => {
            if (!draft) {
                return {
                    name: '',
                    date: '',
                    schedIn: '',
                    schedOut: '',
                    scheduleStatus: '',
                    clearSchedule: false,
                };
            }

            const normalizedSchedIn = String(draft.schedIn || '').trim();
            const normalizedSchedOut = String(draft.schedOut || '').trim();

            return {
                name: String(draft.name || '').trim(),
                date: normalizeDate(draft.date),
                schedIn: draft.clearSchedule ? '' : normalizedSchedIn,
                schedInPeriod: draft.clearSchedule || !normalizedSchedIn ? '' : String(draft.schedInPeriod || '').trim().toUpperCase(),
                schedOut: draft.clearSchedule ? '' : normalizedSchedOut,
                schedOutPeriod: draft.clearSchedule || !normalizedSchedOut ? '' : String(draft.schedOutPeriod || '').trim().toUpperCase(),
                scheduleStatus: draft.clearSchedule ? '' : normalizeAdminScheduleStatus(draft.scheduleStatus),
                clearSchedule: Boolean(draft.clearSchedule),
            };
        };

        const areAdminScheduleDraftsEquivalent = (a, b) => {
            const normalizedA = normalizeAdminScheduleDraftForComparison(a);
            const normalizedB = normalizeAdminScheduleDraftForComparison(b);
            return normalizedA.name === normalizedB.name &&
                normalizedA.date === normalizedB.date &&
                normalizedA.schedIn === normalizedB.schedIn &&
                normalizedA.schedInPeriod === normalizedB.schedInPeriod &&
                normalizedA.schedOut === normalizedB.schedOut &&
                normalizedA.schedOutPeriod === normalizedB.schedOutPeriod &&
                normalizedA.scheduleStatus === normalizedB.scheduleStatus &&
                normalizedA.clearSchedule === normalizedB.clearSchedule;
        };

        const isExpectedScheduleCellCleared = (rows, payload) => {
            const row = getScheduleRowForEmployeeDate(rows, payload?.name, payload?.date);
            if (!row) return true;
            return !hasTimeValue(row.schedIn) &&
                !hasTimeValue(row.schedOut) &&
                !String(row.scheduleStatus || '').trim();
        };

        const parseEditHistory = (reasonText) => {
            if (!reasonText || typeof reasonText !== 'string') return [];
            return reasonText
                .split(/\s*\|\s*(?=\[Edit )/g)
                .map(chunk => chunk.trim())
                .filter(Boolean)
                .map(chunk => {
                    const match = chunk.match(/^\[Edit ([^\]]+)\]:\s*([\s\S]*)$/);
                    if (match) {
                        return {
                            timestamp: match[1].trim(),
                            note: match[2].trim(),
                        };
                    }
                    return { timestamp: '', note: chunk };
                });
        };

        const formatHistoryTimestamp = (rawTimestamp) => {
            if (!rawTimestamp || typeof rawTimestamp !== 'string') return '';
            const parsed = new Date(rawTimestamp);
            if (isNaN(parsed.getTime())) return rawTimestamp.trim();
            return parsed.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        };

        const parseReasonCell = (reasonText) => {
            if (!reasonText || typeof reasonText !== 'string') return [];
            const trimmed = reasonText.trim();
            if (!trimmed) return [];

            // Preferred format: JSON array in one spreadsheet cell
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed
                        .map(item => {
                            if (!item || typeof item !== 'object') return null;
                            const rawTimestamp = typeof item.t === 'string'
                                ? item.t
                                : (typeof item.timestamp === 'string' ? item.timestamp : '');
                            const note = typeof item.n === 'string'
                                ? item.n
                                : (typeof item.note === 'string' ? item.note : '');
                            const editor = typeof item.by === 'string'
                                ? item.by
                                : (typeof item.editor === 'string'
                                    ? item.editor
                                    : (typeof item.byName === 'string' ? item.byName : ''));
                            if (!note.trim()) return null;
                            return {
                                timestamp: formatHistoryTimestamp(rawTimestamp),
                                rawTimestamp,
                                editor: editor.trim(),
                                note: note.trim(),
                            };
                        })
                        .filter(Boolean);
                }
            } catch (_) {}

            // Backward-compatible fallback for legacy pipe-delimited entries
            return parseEditHistory(trimmed).map(entry => ({
                timestamp: entry.timestamp,
                rawTimestamp: entry.timestamp,
                editor: '',
                note: entry.note,
            }));
        };
