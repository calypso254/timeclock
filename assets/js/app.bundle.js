(() => {
  const { useState, useEffect, useRef } = React;
  const normalizeDate = (dStr) => {
    if (typeof dStr === "string" && /^\d{4}-\d{2}-\d{2}/.test(dStr)) {
      return dStr.substring(0, 10);
    }
    const d = new Date(dStr);
    if (isNaN(d)) return dStr;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const parseLocalDate = (dateValue) => {
    if (!dateValue) return /* @__PURE__ */ new Date();
    if (dateValue instanceof Date) {
      return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
    }
    if (typeof dateValue === "number") {
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
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const formatFullDate = (dateStr) => {
    if (!dateStr) return "";
    const dateObj = parseLocalDate(dateStr);
    if (isNaN(dateObj.getTime())) return normalizeDate(dateStr);
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const getWeekStartDate = (dateValue = /* @__PURE__ */ new Date()) => {
    const dateObj = parseLocalDate(dateValue);
    const day = dateObj.getDay();
    const diff = dateObj.getDate() - day;
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), diff);
  };
  const ADMIN_ROLES = ["admin", "manager", "owner"];
  const DEFAULT_ADMIN_SCHEDULE_STATUS = "Draft";
  const TIME_OFF_STATUS = {
    REQUESTED: "Time Off Requested",
    APPROVED: "Time Off Approved"
  };
  const TIME_OFF_NOTE_KIND = "time_off";
  const PAYROLL_PERIOD_ANCHOR = "2026-03-16";
  const PAYROLL_PERIOD_LENGTH_DAYS = 14;
  const PAYROLL_PAYDAY_OFFSET_DAYS = 5;
  const MESSAGE_MAX_LENGTH = 1e3;
  const MESSAGE_REACTION_OPTIONS = [
    { key: "thumbs_up", icon: "fa-thumbs-up", label: "Seen" },
    { key: "heart", icon: "fa-heart", label: "Support" },
    { key: "star", icon: "fa-star", label: "Important" }
  ];
  const PEN_HOSPITAL_STATUS = {
    DIAGNOSED: "Diagnosed",
    ADMITTED: "Admitted",
    IN_SURGERY: "In Surgery",
    IN_RECOVERY: "In Recovery",
    READY_FOR_RELEASE: "Ready For Release",
    DISCHARGED: "Discharged"
  };
  const PEN_HOSPITAL_STATUS_OPTIONS = [
    { value: PEN_HOSPITAL_STATUS.DIAGNOSED, label: "Diagnosed" },
    { value: PEN_HOSPITAL_STATUS.ADMITTED, label: "Admitted" },
    { value: PEN_HOSPITAL_STATUS.IN_SURGERY, label: "In Surgery" },
    { value: PEN_HOSPITAL_STATUS.IN_RECOVERY, label: "In Recovery" },
    { value: PEN_HOSPITAL_STATUS.READY_FOR_RELEASE, label: "Ready For Release" },
    { value: PEN_HOSPITAL_STATUS.DISCHARGED, label: "Discharged" }
  ];
  const PEN_HOSPITAL_BOARD_SECTIONS = [
    {
      key: "inbound",
      title: "Inbound",
      subtitle: "Diagnosed and admitted returns waiting for surgery.",
      countClass: "bg-[#ccfbf1]",
      cardClass: "bg-[#f0fdfa]"
    },
    {
      key: "in_process",
      title: "In Process",
      subtitle: "Pens actively moving through surgery and recovery.",
      countClass: "bg-[#dbeafe]",
      cardClass: "bg-[#eff6ff]"
    },
    {
      key: "ready",
      title: "Ready To Ship",
      subtitle: "Repaired pens that are ready for release back to the customer.",
      countClass: "bg-[#dcfce7]",
      cardClass: "bg-[#f0fdf4]"
    },
    {
      key: "completed",
      title: "Discharged",
      subtitle: "Completed repairs that have already gone back out.",
      countClass: "bg-[#f3e8ff]",
      cardClass: "bg-[#faf5ff]"
    }
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
    return parseLocalDate(dateValue).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const formatWeekRangeLabel = (weekStart) => {
    const weekDays = buildWeekDays(weekStart);
    return `${formatShortDateLabel(weekStart)} - ${formatShortDateLabel(weekDays[6])}`;
  };
  const getLocalDateDayStamp = (dateValue) => {
    const dateObj = parseLocalDate(dateValue);
    return Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  };
  const getPayrollPeriodStart = (dateValue = /* @__PURE__ */ new Date()) => {
    const anchorStamp = getLocalDateDayStamp(PAYROLL_PERIOD_ANCHOR);
    const targetStamp = getLocalDateDayStamp(dateValue);
    const diffDays = Math.floor((targetStamp - anchorStamp) / 864e5);
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
      fullLabel: `${formatFullDate(startDate)} - ${formatFullDate(endDate)}`
    };
  };
  const isAdminRole = (role) => {
    return ADMIN_ROLES.includes(String(role || "").trim().toLowerCase());
  };
  const normalizeMessageRole = (role) => {
    const normalized = String(role || "").trim().toLowerCase();
    return isAdminRole(normalized) ? "admin" : normalized || "employee";
  };
  const formatRoleLabel = (role, fallback = "Employee") => {
    const normalized = String(role || "").trim();
    if (!normalized) return fallback;
    return normalized.split(/[\s_-]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
  };
  const isEmployeeActive = (employee) => {
    if (!employee) return false;
    if (typeof employee.active === "boolean") return employee.active;
    const normalized = String(employee.active ?? "").trim().toLowerCase();
    if (!normalized) return true;
    return ["true", "yes", "y", "1", "active"].includes(normalized);
  };
  const parseCurrencyNumber = (value) => {
    if (value === null || value === void 0 || value === "") return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const normalized = String(value).replace(/[^0-9.\-]/g, "");
    if (!normalized) return null;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const formatCurrencyAmount = (value) => {
    const numericValue = parseCurrencyNumber(value);
    if (!Number.isFinite(numericValue)) return "";
    return numericValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  };
  const getEmployeeHourlyWage = (employee) => {
    if (!employee || typeof employee !== "object") return null;
    const candidates = [
      employee.hourlyWageValue,
      employee.hourlyWage,
      employee.wage,
      employee.payRate,
      employee.hourlyRate,
      employee.rate
    ];
    for (const candidate of candidates) {
      const parsed = parseCurrencyNumber(candidate);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };
  const buildEmployeeAdminDraft = (employee) => ({
    rowNumber: employee?.rowNumber || "",
    name: String(employee?.name || ""),
    jobTitle: String(employee?.jobTitle || employee?.department || ""),
    pin: String(employee?.pin || ""),
    role: String(employee?.role || "employee"),
    active: isEmployeeActive(employee),
    hourlyWage: (() => {
      const numericHourlyWage = getEmployeeHourlyWage(employee);
      if (Number.isFinite(numericHourlyWage)) return String(numericHourlyWage);
      return String(employee?.hourlyWage || "").trim();
    })(),
    phoneNumber: String(employee?.phoneNumber || "")
  });
  const buildEmptyEmployeeAdminDraft = () => ({
    rowNumber: "",
    name: "",
    jobTitle: "",
    pin: "",
    role: "employee",
    active: true,
    hourlyWage: "",
    phoneNumber: ""
  });
  const getEmployeeDisplayOrderValue = (employee) => {
    const candidates = [
      employee?.displayOrder,
      employee?.sortOrder,
      employee?.order,
      employee?.position,
      employee?.rowNumber
    ];
    for (const candidate of candidates) {
      const numericValue = Number(candidate);
      if (Number.isFinite(numericValue)) return numericValue;
    }
    return null;
  };
  const sortEmployeesForDisplay = (employeeList) => {
    return (Array.isArray(employeeList) ? employeeList : []).map((employee, index) => ({
      employee,
      index,
      orderValue: getEmployeeDisplayOrderValue(employee)
    })).sort((a, b) => {
      const aHasExplicitOrder = a.orderValue !== null;
      const bHasExplicitOrder = b.orderValue !== null;
      if (aHasExplicitOrder && bHasExplicitOrder && a.orderValue !== b.orderValue) {
        return a.orderValue - b.orderValue;
      }
      if (aHasExplicitOrder !== bHasExplicitOrder) {
        return aHasExplicitOrder ? -1 : 1;
      }
      return a.index - b.index;
    }).map(({ employee }) => employee);
  };
  const normalizeMessageText = (value) => {
    return String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  };
  const normalizeMessageReactionKey = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    return MESSAGE_REACTION_OPTIONS.some((option) => option.key === normalized) ? normalized : "";
  };
  const sanitizeMessageReactions = (value) => {
    if (!Array.isArray(value)) return [];
    const deduped = /* @__PURE__ */ new Map();
    value.forEach((entry) => {
      if (!entry || typeof entry !== "object") return;
      const name = String(entry.name || entry.senderName || "").trim();
      const role = normalizeMessageRole(entry.role || entry.senderRole);
      const reaction = normalizeMessageReactionKey(entry.reaction || entry.key);
      const updatedAt = String(entry.updatedAt || entry.at || "").trim();
      if (!name || !reaction) return;
      deduped.set(`${name.toLowerCase()}|${role}`, { name, role, reaction, updatedAt });
    });
    return Array.from(deduped.values()).sort((a, b) => a.name.localeCompare(b.name));
  };
  const getMessageReactionSummary = (value) => {
    const reactions = sanitizeMessageReactions(value);
    return MESSAGE_REACTION_OPTIONS.map((option) => {
      const matching = reactions.filter((entry) => entry.reaction === option.key);
      if (matching.length === 0) return null;
      return {
        ...option,
        count: matching.length,
        names: matching.map((entry) => entry.name)
      };
    }).filter(Boolean);
  };
  const getViewerMessageReaction = (value, viewerName = "", viewerRole = "") => {
    const normalizedViewerName = String(viewerName || "").trim().toLowerCase();
    if (!normalizedViewerName) return "";
    const normalizedViewerRole = normalizeMessageRole(viewerRole || "employee");
    const reactions = sanitizeMessageReactions(value);
    const match = reactions.find(
      (entry) => entry.name.toLowerCase() === normalizedViewerName && entry.role === normalizedViewerRole
    );
    return match?.reaction || "";
  };
  const isLikelyLegacyMessageResponse = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return false;
    return rows.some(
      (row) => row && typeof row === "object" && !Array.isArray(row) && "pin" in row && "department" in row && !("message" in row)
    );
  };
  const formatMessageTimestamp = (value, isoTimestamp = "") => {
    const candidate = isoTimestamp || value;
    if (!candidate) return "";
    const parsed = new Date(candidate);
    if (isNaN(parsed.getTime())) return String(value || "");
    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };
  const normalizeAdminScheduleStatus = (value, fallback = DEFAULT_ADMIN_SCHEDULE_STATUS) => {
    const normalized = String(value || "").trim();
    return normalized || fallback;
  };
  const isTimeOffStatus = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === TIME_OFF_STATUS.REQUESTED.toLowerCase() || normalized === TIME_OFF_STATUS.APPROVED.toLowerCase();
  };
  const isTimeOffRequestedStatus = (value) => {
    return String(value || "").trim().toLowerCase() === TIME_OFF_STATUS.REQUESTED.toLowerCase();
  };
  const isTimeOffApprovedStatus = (value) => {
    return String(value || "").trim().toLowerCase() === TIME_OFF_STATUS.APPROVED.toLowerCase();
  };
  const buildEmptyAdminScheduleForm = (employeeName = "", dateValue = /* @__PURE__ */ new Date()) => ({
    name: employeeName,
    date: normalizeDate(dateValue),
    schedIn: "",
    schedInPeriod: "AM",
    schedOut: "",
    schedOutPeriod: "PM",
    scheduleStatus: DEFAULT_ADMIN_SCHEDULE_STATUS,
    clearSchedule: false,
    sourceRow: null
  });
  const buildEmptyAdminTemplateDraft = () => ({
    schedIn: "",
    schedInPeriod: "AM",
    schedOut: "",
    schedOutPeriod: "PM",
    scheduleStatus: DEFAULT_ADMIN_SCHEDULE_STATUS
  });
  const hasTimeValue = (value) => {
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return normalized !== "" && normalized !== "-" && normalized !== "n/a";
    }
    return Boolean(value);
  };
  const normalizeClockTimeText = (value) => {
    if (value === null || value === void 0) return "";
    return String(value).replace(/[\u00A0\u202F]/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
  };
  const parseClockTimeToMinutes = (value) => {
    if (!hasTimeValue(value)) return null;
    const normalizedValue = normalizeClockTimeText(value);
    const match = normalizedValue.match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/);
    if (!match) return null;
    let hour = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hour < 1 || hour > 12) return null;
    if (match[3] === "AM") {
      if (hour === 12) hour = 0;
    } else if (hour !== 12) {
      hour += 12;
    }
    return hour * 60 + minutes;
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
    if (minutes === null || minutes === void 0) return "-";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  const formatWorkedDurationForSheet = (minutes) => {
    if (minutes === null || minutes === void 0) return "";
    return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
  };
  const formatDecimalHours = (minutes) => {
    if (minutes === null || minutes === void 0) return "";
    return (minutes / 60).toFixed(2);
  };
  const buildWorkedDurationFields = (timeIn, timeOut) => {
    const workedMinutes = calculateWorkedMinutes(timeIn, timeOut);
    if (workedMinutes === null) {
      return {
        workedMinutes: "",
        workedDuration: "",
        workedDisplay: "",
        decimalHours: ""
      };
    }
    return {
      workedMinutes,
      workedDuration: formatWorkedDurationForSheet(workedMinutes),
      workedDisplay: formatWorkedDurationForDisplay(workedMinutes),
      decimalHours: formatDecimalHours(workedMinutes)
    };
  };
  const MIDNIGHT_AUTO_CLOCK_OUT_TIME = "12:00 AM";
  const buildMidnightAutoClockOutMessage = (employeeName, row, { completed = false } = {}) => {
    const nameLabel = String(employeeName || "This employee").trim() || "This employee";
    const shiftDateLabel = formatFullDate(row?.date) || "a prior day";
    if (completed) {
      return `The open shift for ${nameLabel} on ${shiftDateLabel} was auto clocked out at ${MIDNIGHT_AUTO_CLOCK_OUT_TIME}. Please edit that shift in My Timesheet if work continued past midnight.`;
    }
    return `The open shift for ${nameLabel} on ${shiftDateLabel} will auto clock out at ${MIDNIGHT_AUTO_CLOCK_OUT_TIME} so shifts do not continue past midnight. Please edit that shift in My Timesheet if work continued later.`;
  };
  const getMidnightAutoClockOutDetails = (rows, employeeName, localDate) => {
    if (!employeeName || !localDate) return null;
    const openShifts = getOpenShiftRowsForEmployee(rows, employeeName);
    const sameDayOpen = openShifts.filter((row2) => normalizeDate(row2.date) === localDate);
    const olderOpen = openShifts.filter((row2) => normalizeDate(row2.date) < localDate);
    const futureOpen = openShifts.filter((row2) => normalizeDate(row2.date) > localDate);
    if (openShifts.length !== 1 || sameDayOpen.length > 0 || futureOpen.length > 0 || olderOpen.length !== 1) {
      return null;
    }
    const row = olderOpen[0];
    return {
      row,
      time: MIDNIGHT_AUTO_CLOCK_OUT_TIME,
      previewMessage: buildMidnightAutoClockOutMessage(employeeName, row),
      completedMessage: buildMidnightAutoClockOutMessage(employeeName, row, { completed: true })
    };
  };
  const calculateHours = (start, end) => {
    const workedMinutes = calculateWorkedMinutes(start, end);
    return workedMinutes === null ? "-" : formatWorkedDurationForDisplay(workedMinutes);
  };
  const isPublishedSchedule = (row) => {
    return String(row?.scheduleStatus || "").trim().toLowerCase() === "published";
  };
  const filterTimesheetRowsUpToToday = (rows) => {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    return rows.filter((row) => {
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
    return a.name === b.name && normalizeDate(a.date) === normalizeDate(b.date) && normalizeTimeForComparison(a.timeIn || "") === normalizeTimeForComparison(b.timeIn || "") && normalizeTimeForComparison(a.timeOut || "") === normalizeTimeForComparison(b.timeOut || "");
  };
  const isEntryLocked = (row) => {
    return String(row?.payrollStatus || "").trim().toLowerCase() === "locked";
  };
  const parseTimeOffMetadata = (reasonText) => {
    if (!reasonText || typeof reasonText !== "string") return null;
    const trimmed = reasonText.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || parsed.kind !== TIME_OFF_NOTE_KIND) {
        return null;
      }
      return {
        kind: TIME_OFF_NOTE_KIND,
        fullDay: parsed.fullDay === true,
        requestedBy: String(parsed.requestedBy || "").trim(),
        requestedAt: String(parsed.requestedAt || "").trim(),
        updatedAt: String(parsed.updatedAt || "").trim(),
        approvedBy: String(parsed.approvedBy || "").trim(),
        approvedAt: String(parsed.approvedAt || "").trim()
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
    if (!row) return "";
    if (resolveTimeOffFullDay(row, metadata)) return "Full day";
    if (hasTimeValue(row.schedIn) && hasTimeValue(row.schedOut)) {
      return `${row.schedIn} - ${row.schedOut}`;
    }
    return "Hours requested";
  };
  const getTimeOffStatusLabel = (row) => {
    if (isApprovedTimeOffRow(row)) return "Approved";
    if (isTimeOffRequestRow(row)) return "Requested";
    return "Time Off";
  };
  const getTimeOffRowForEmployeeDate = (rows, employeeName, dateValue) => {
    const targetDate = normalizeDate(dateValue);
    const candidates = getEmployeeRows(rows, employeeName).filter(
      (row) => normalizeDate(row.date) === targetDate && !isEntryLocked(row) && isTimeOffRow(row)
    );
    if (candidates.length === 0) return null;
    return candidates.find(isApprovedTimeOffRow) || candidates.find(isTimeOffRequestRow) || candidates[0];
  };
  const isPastScheduleDate = (dateValue) => {
    return normalizeDate(dateValue) < normalizeDate(/* @__PURE__ */ new Date());
  };
  const isPayrollRelevantRow = (row) => {
    if (!row) return false;
    if (hasTimeValue(row.decimalHours) || hasTimeValue(row.totalHours)) return true;
    return hasTimeValue(row.timeIn) || hasTimeValue(row.timeOut);
  };
  const getPayrollRowMinutes = (row) => {
    if (!row) return 0;
    const decimalValue = Number.parseFloat(String(row.decimalHours || "").trim());
    if (Number.isFinite(decimalValue) && decimalValue > 0) {
      return Math.round(decimalValue * 60);
    }
    const workedMinutes = calculateWorkedMinutes(row.timeIn, row.timeOut);
    return workedMinutes === null ? 0 : workedMinutes;
  };
  const formatPayrollHours = (minutes) => {
    if (!minutes) return "0.00";
    return (minutes / 60).toFixed(2);
  };
  const getEmployeeRows = (rows, employeeName) => {
    if (!employeeName) return [];
    return rows.filter((row) => row.name === employeeName);
  };
  const getOpenShiftRowsForEmployee = (rows, employeeName) => {
    return getEmployeeRows(rows, employeeName).filter((row) => !isTimeOffRow(row) && hasTimeValue(row.timeIn) && !hasTimeValue(row.timeOut) && !isEntryLocked(row)).slice().sort((a, b) => normalizeDate(a.date).localeCompare(normalizeDate(b.date)));
  };
  const listShiftDates = (rows) => {
    return [...new Set((rows || []).map((row) => formatFullDate(row.date)).filter(Boolean))].join(", ");
  };
  const buildRowFingerprint = (row) => {
    if (!row) return "";
    return JSON.stringify({
      date: normalizeDate(row.date),
      name: row.name || "",
      timeIn: row.timeIn || "",
      timeOut: row.timeOut || "",
      schedIn: row.schedIn || "",
      schedOut: row.schedOut || "",
      payrollStatus: row.payrollStatus || "",
      scheduleStatus: row.scheduleStatus || ""
    });
  };
  const buildRowContextPayload = (row) => {
    if (!row) {
      return {
        targetRowDate: "",
        targetRowKey: "",
        targetRowTimeIn: "",
        targetRowTimeOut: "",
        targetRowSchedIn: "",
        targetRowSchedOut: "",
        targetRowPayrollStatus: "",
        targetRowScheduleStatus: ""
      };
    }
    return {
      targetRowDate: normalizeDate(row.date),
      targetRowKey: buildRowFingerprint(row),
      targetRowTimeIn: row.timeIn || "",
      targetRowTimeOut: row.timeOut || "",
      targetRowSchedIn: row.schedIn || "",
      targetRowSchedOut: row.schedOut || "",
      targetRowPayrollStatus: row.payrollStatus || "",
      targetRowScheduleStatus: row.scheduleStatus || ""
    };
  };
  const buildActionTimestamp = (now = /* @__PURE__ */ new Date()) => {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return {
      localDate: `${year}-${month}-${day}`,
      localTime: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }),
      isoTimestamp: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      timezoneOffsetMinutes: now.getTimezoneOffset()
    };
  };
  const parseWholeNumber = (value, { allowNegative = false } = {}) => {
    if (value === null || value === void 0) return null;
    const trimmed = String(value).trim();
    if (!trimmed) return null;
    if (!/^[+-]?\d+$/.test(trimmed)) return null;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return null;
    if (allowNegative) return parsed === 0 ? null : parsed;
    return parsed > 0 ? parsed : null;
  };
  const getInventoryStatusWeight = (status) => {
    switch (String(status || "").trim()) {
      case "Awaiting Approval":
        return 0;
      case "In Process":
        return 1;
      case "Open":
        return 2;
      case "Completed":
      case "Complete":
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
    return (Array.isArray(rows) ? rows : []).filter((row) => Number(row?.stillNeeded || 0) > 0 || Number(row?.inProcess || 0) > 0 || Number(row?.awaitingApproval || 0) > 0);
  };
  const formatInventoryTimestamp = (value) => {
    return value ? String(value) : "Not yet updated";
  };
  const normalizePenHospitalStatus = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    const match = PEN_HOSPITAL_STATUS_OPTIONS.find((option) => option.value.toLowerCase() === normalized);
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
        return "inbound";
      case PEN_HOSPITAL_STATUS.IN_SURGERY:
      case PEN_HOSPITAL_STATUS.IN_RECOVERY:
        return "in_process";
      case PEN_HOSPITAL_STATUS.READY_FOR_RELEASE:
        return "ready";
      case PEN_HOSPITAL_STATUS.DISCHARGED:
        return "completed";
      default:
        return "inbound";
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
    return PEN_HOSPITAL_BOARD_SECTIONS.map((section) => ({
      ...section,
      count: safeCases.filter((caseRow) => getPenHospitalBoardKey(caseRow?.status) === section.key).length
    }));
  };
  const formatPenHospitalTimestamp = (value, isoTimestamp = "") => {
    return formatMessageTimestamp(value, isoTimestamp) || "Not yet updated";
  };
  const canUserSetPenHospitalStatus = (role, nextStatus) => {
    const normalizedStatus = normalizePenHospitalStatus(nextStatus);
    if (isAdminRole(role)) return true;
    return normalizedStatus !== PEN_HOSPITAL_STATUS.DIAGNOSED && normalizedStatus !== PEN_HOSPITAL_STATUS.DISCHARGED;
  };
  const getPenHospitalStatusChipClasses = (status) => {
    switch (normalizePenHospitalStatus(status)) {
      case PEN_HOSPITAL_STATUS.DIAGNOSED:
        return "bg-[#fde68a]";
      case PEN_HOSPITAL_STATUS.ADMITTED:
        return "bg-[#ccfbf1]";
      case PEN_HOSPITAL_STATUS.IN_SURGERY:
        return "bg-[#bfdbfe]";
      case PEN_HOSPITAL_STATUS.IN_RECOVERY:
        return "bg-[#ddd6fe]";
      case PEN_HOSPITAL_STATUS.READY_FOR_RELEASE:
        return "bg-[#bbf7d0]";
      case PEN_HOSPITAL_STATUS.DISCHARGED:
        return "bg-[#f5d0fe]";
      default:
        return "bg-[#f3f4f6]";
    }
  };
  const formatPenHospitalExpectedLabel = (caseRow) => {
    const expectedCount = Number(caseRow?.expectedCount || 0);
    if (!expectedCount) return "No expected pen count";
    return `${expectedCount} pen${expectedCount === 1 ? "" : "s"} expected`;
  };
  const getTodayPublishedShifts = (sheetData) => {
    const todayKey = normalizeDate(/* @__PURE__ */ new Date());
    return (Array.isArray(sheetData) ? sheetData : []).filter(
      (row) => !isTimeOffRow(row) && normalizeDate(row?.date) === todayKey && (hasTimeValue(row?.schedIn) || hasTimeValue(row?.schedOut)) && isPublishedSchedule(row)
    ).slice().sort((a, b) => {
      const timeCompare = (parseClockTimeToMinutes(a.schedIn) || 0) - (parseClockTimeToMinutes(b.schedIn) || 0);
      if (timeCompare !== 0) return timeCompare;
      return String(a.name || "").localeCompare(String(b.name || ""));
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
      awaitingApproval: 0
    });
    return { openRows, totals };
  };
  const getInventorySkuText = (row) => {
    return String(row?.sku || "").trim() || "No SKU";
  };
  const getInventoryNameText = (row) => {
    return String(row?.product || "").trim() || "No name entered";
  };
  const applySuccessfulPunchLocally = (rows, actionType, employeeName, timestamp, plan, reason = "") => {
    const safeRows = Array.isArray(rows) ? rows.slice() : [];
    if (actionType === "CLOCK_IN") {
      if (!plan?.row) {
        return [{
          date: timestamp.localDate,
          name: employeeName,
          schedIn: "",
          schedOut: "",
          timeIn: timestamp.localTime,
          timeOut: "",
          reason,
          payrollStatus: "Open",
          scheduleStatus: ""
        }, ...safeRows];
      }
      return safeRows.map((row) => isSameTimesheetEntry(row, plan.row) ? { ...row, timeIn: timestamp.localTime, reason: reason || row.reason || "" } : row);
    }
    if (!plan?.row) {
      return safeRows;
    }
    return safeRows.map((row) => isSameTimesheetEntry(row, plan.row) ? { ...row, timeOut: timestamp.localTime } : row);
  };
  const getExpectedActionRow = (rows, actionType, employeeName, timestamp, plan) => {
    if (!Array.isArray(rows)) return null;
    if (actionType === "CLOCK_IN") {
      return rows.find(
        (row) => row.name === employeeName && normalizeDate(row.date) === timestamp.localDate && normalizeTimeForComparison(row.timeIn || "") === normalizeTimeForComparison(timestamp.localTime)
      ) || null;
    }
    return rows.find(
      (row) => row.name === employeeName && normalizeDate(row.date) === timestamp.localDate && normalizeTimeForComparison(row.timeOut || "") === normalizeTimeForComparison(timestamp.localTime) && (!plan?.row?.timeIn || normalizeTimeForComparison(row.timeIn || "") === normalizeTimeForComparison(plan.row.timeIn || ""))
    ) || null;
  };
  const getExpectedScheduleRow = (rows, payload) => {
    if (!Array.isArray(rows) || !payload) return null;
    return rows.find(
      (row) => !isTimeOffRow(row) && row.name === payload.name && normalizeDate(row.date) === payload.date && normalizeTimeForComparison(row.schedIn || "") === normalizeTimeForComparison(payload.schedIn || "") && normalizeTimeForComparison(row.schedOut || "") === normalizeTimeForComparison(payload.schedOut || "") && String(row.scheduleStatus || "").trim() === String(payload.scheduleStatus || "").trim()
    ) || null;
  };
  const getLateStartNote = (scheduledIn, actualTime) => {
    const scheduledMinutes = parseClockTimeToMinutes(scheduledIn);
    const actualMinutes = parseClockTimeToMinutes(actualTime);
    if (scheduledMinutes === null || actualMinutes === null) return "";
    return actualMinutes - scheduledMinutes > 5 ? "Late Start" : "";
  };
  const resolveClockInPlan = (rows, employeeName, localDate) => {
    const approvedTimeOffRow = getTimeOffRowForEmployeeDate(rows, employeeName, localDate);
    if (isApprovedTimeOffRow(approvedTimeOffRow)) {
      return {
        status: "blocked",
        code: "approved-time-off",
        message: `${employeeName} has approved time off for ${formatFullDate(localDate)} (${getTimeOffRangeLabel(approvedTimeOffRow)}).`,
        rows: [approvedTimeOffRow]
      };
    }
    const openShifts = getOpenShiftRowsForEmployee(rows, employeeName);
    const sameDayOpen = openShifts.filter((row) => normalizeDate(row.date) === localDate);
    const olderOpen = openShifts.filter((row) => normalizeDate(row.date) < localDate);
    const futureOpen = openShifts.filter((row) => normalizeDate(row.date) > localDate);
    const autoClockOut = getMidnightAutoClockOutDetails(rows, employeeName, localDate);
    const withAutoClockOut = (plan) => autoClockOut ? { ...plan, autoClockOut } : plan;
    if (sameDayOpen.length === 1 && openShifts.length === 1) {
      return withAutoClockOut({
        status: "blocked",
        code: "already-clocked-in",
        message: `${employeeName} is already clocked in for ${formatFullDate(localDate)}.`,
        rows: sameDayOpen
      });
    }
    if (openShifts.length > 1 || sameDayOpen.length > 1) {
      return withAutoClockOut({
        status: "blocked",
        code: "multiple-open-shifts",
        message: `Automatic clock actions are paused because ${employeeName} has multiple open shifts (${listShiftDates(openShifts)}). Fix those entries in My Timesheet first so a new punch cannot land on the wrong row.`,
        rows: openShifts
      });
    }
    if (olderOpen.length > 0 && !autoClockOut) {
      return withAutoClockOut({
        status: "blocked",
        code: "prior-open-shift",
        message: `Automatic clock actions are paused because ${employeeName} still has an open shift from ${formatFullDate(olderOpen[0].date)}. Add the missing clock-out on that row before recording a new punch.`,
        rows: olderOpen
      });
    }
    if (futureOpen.length > 0) {
      return withAutoClockOut({
        status: "blocked",
        code: "future-open-shift",
        message: `Automatic clock actions are paused because there is an open shift dated ${formatFullDate(futureOpen[0].date)}. Please correct that row before recording a new punch.`,
        rows: futureOpen
      });
    }
    const candidates = getEmployeeRows(rows, employeeName).filter(
      (row) => normalizeDate(row.date) === localDate && !isTimeOffRow(row) && !hasTimeValue(row.timeIn) && !hasTimeValue(row.timeOut) && !isEntryLocked(row)
    );
    if (candidates.length === 0) {
      return withAutoClockOut({ status: "ready", code: "new-row", row: null });
    }
    if (candidates.length === 1) {
      return withAutoClockOut({ status: "ready", code: "existing-row", row: candidates[0] });
    }
    const scheduledCandidates = candidates.filter((row) => hasTimeValue(row.schedIn) || hasTimeValue(row.schedOut));
    if (scheduledCandidates.length === 1) {
      return withAutoClockOut({ status: "ready", code: "existing-row", row: scheduledCandidates[0] });
    }
    return withAutoClockOut({
      status: "blocked",
      code: "ambiguous-clock-in-row",
      message: `Automatic clock-in is paused because there are multiple blank rows for ${formatFullDate(localDate)}. Please have a manager review today's schedule row before punching in.`,
      rows: candidates
    });
  };
  const hasOpenShiftForToday = (rows, employeeName) => {
    if (!employeeName) return false;
    const todayKey = normalizeDate(/* @__PURE__ */ new Date());
    return getOpenShiftRowsForEmployee(rows, employeeName).some((row) => normalizeDate(row.date) === todayKey);
  };
  const resolveClockOutPlan = (rows, employeeName, localDate) => {
    const approvedTimeOffRow = getTimeOffRowForEmployeeDate(rows, employeeName, localDate);
    const openShifts = getOpenShiftRowsForEmployee(rows, employeeName);
    const sameDayOpen = openShifts.filter((row) => normalizeDate(row.date) === localDate);
    const olderOpen = openShifts.filter((row) => normalizeDate(row.date) < localDate);
    const futureOpen = openShifts.filter((row) => normalizeDate(row.date) > localDate);
    if (sameDayOpen.length === 1 && openShifts.length === 1) {
      return { status: "ready", code: "exact-open-shift", row: sameDayOpen[0] };
    }
    if (openShifts.length === 0) {
      if (isApprovedTimeOffRow(approvedTimeOffRow)) {
        return {
          status: "blocked",
          code: "approved-time-off",
          message: `${employeeName} has approved time off for ${formatFullDate(localDate)} (${getTimeOffRangeLabel(approvedTimeOffRow)}).`,
          rows: [approvedTimeOffRow]
        };
      }
      return {
        status: "blocked",
        code: "no-open-shift",
        message: `No open shift was found for ${formatFullDate(localDate)}.`,
        rows: []
      };
    }
    if (sameDayOpen.length > 1 || openShifts.length > 1) {
      return {
        status: "blocked",
        code: "multiple-open-shifts",
        message: `Automatic clock-out is paused because ${employeeName} has multiple open shifts (${listShiftDates(openShifts)}). This keeps a clock-out from being saved on the wrong day.`,
        rows: openShifts
      };
    }
    if (olderOpen.length === 1 && sameDayOpen.length === 0) {
      return {
        status: "blocked",
        code: "prior-open-shift",
        message: `Automatic clock-out is paused because the only open shift for ${employeeName} is on ${formatFullDate(olderOpen[0].date)}. Correct that row in My Timesheet instead of clocking out on today's screen.`,
        rows: olderOpen
      };
    }
    if (futureOpen.length === 1 && sameDayOpen.length === 0) {
      return {
        status: "blocked",
        code: "future-open-shift",
        message: `Automatic clock-out is paused because the only open shift for ${employeeName} is dated ${formatFullDate(futureOpen[0].date)}. Correct that row before recording another punch.`,
        rows: futureOpen
      };
    }
    return {
      status: "blocked",
      code: "ambiguous-clock-out-row",
      message: `Automatic clock-out is paused because the open shift could not be matched to ${formatFullDate(localDate)}.`,
      rows: openShifts
    };
  };
  const normalizeTimeInputWithPeriod = (value, currentPeriod = "") => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 4);
    if (digits.length === 0) return { time: "", period: currentPeriod };
    if (digits.length <= 2) return { time: digits, period: currentPeriod };
    if (digits.length === 3) return { time: `${digits.slice(0, 1)}:${digits.slice(1)}`, period: currentPeriod };
    const hour24 = parseInt(digits.slice(0, 2), 10);
    const minutes = digits.slice(2);
    if (!isNaN(hour24) && hour24 >= 0 && hour24 <= 23) {
      const period = hour24 >= 12 ? "PM" : "AM";
      const hour12 = hour24 % 12 || 12;
      return { time: `${hour12}:${minutes}`, period };
    }
    return { time: `${digits.slice(0, 2)}:${minutes}`, period: currentPeriod };
  };
  const parseTimeField = (value) => {
    if (!value || typeof value !== "string") {
      return { time: "", period: "" };
    }
    const match = normalizeClockTimeText(value).match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/);
    if (!match) {
      return { time: "", period: "" };
    }
    const hour = parseInt(match[1], 10);
    if (hour < 1 || hour > 12) {
      return { time: "", period: "" };
    }
    return { time: `${hour}:${match[2]}`, period: match[3] };
  };
  const formatTimeField = (timeValue, periodValue) => {
    const cleanedTime = String(timeValue || "").trim();
    if (!cleanedTime) return "";
    const match = cleanedTime.match(/^(\d{1,2}):([0-5]\d)$/);
    const period = String(periodValue || "").toUpperCase();
    if (!match || period !== "AM" && period !== "PM") return null;
    const hour = parseInt(match[1], 10);
    if (hour < 1 || hour > 12) return null;
    return `${hour}:${match[2]} ${period}`;
  };
  const buildEmptyTimeOffRequestDraft = (dateValue = /* @__PURE__ */ new Date()) => ({
    date: normalizeDate(dateValue),
    fullDay: true,
    schedIn: "",
    schedInPeriod: "AM",
    schedOut: "",
    schedOutPeriod: "PM",
    sourceRow: null
  });
  const buildTimeOffRequestDraftFromRow = (row, dateValue = /* @__PURE__ */ new Date()) => {
    const metadata = parseTimeOffMetadata(row?.reason);
    const parsedIn = parseTimeField(row?.schedIn || "");
    const parsedOut = parseTimeField(row?.schedOut || "");
    return {
      ...buildEmptyTimeOffRequestDraft(dateValue || row?.date || /* @__PURE__ */ new Date()),
      fullDay: resolveTimeOffFullDay(row, metadata),
      schedIn: parsedIn.time,
      schedInPeriod: parsedIn.period || "AM",
      schedOut: parsedOut.time,
      schedOutPeriod: parsedOut.period || "PM",
      sourceRow: row || null
    };
  };
  const formatTimeOffDraftRange = (draft) => {
    if (!draft) return "";
    if (draft.fullDay) return "Full day";
    const formattedIn = formatTimeField(draft.schedIn, draft.schedInPeriod);
    const formattedOut = formatTimeField(draft.schedOut, draft.schedOutPeriod);
    if (!formattedIn || !formattedOut) return "";
    return `${formattedIn} - ${formattedOut}`;
  };
  const ADMIN_SHIFT_TEMPLATE_ACCENTS = [
    "bg-[#bfdbfe]",
    "bg-[#fde68a]",
    "bg-[#fecdd3]",
    "bg-[#bbf7d0]",
    "bg-[#ddd6fe]",
    "bg-[#fdba74]"
  ];
  const ADMIN_SHIFT_UTILITY_TEMPLATE = {
    id: "clear-cell",
    label: "Remove Shift",
    schedIn: "",
    schedOut: "",
    scheduleStatus: "",
    clearSchedule: true,
    accent: "bg-[#f8fafc]",
    isBuiltIn: true
  };
  const buildShiftTemplateId = (label = "template") => {
    return `template-${String(label || "template").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "template"}-${Date.now()}`;
  };
  const normalizeAdminShiftTemplate = (template, index = 0) => {
    if (!template || typeof template !== "object") return null;
    const label = String(template.label || "").trim();
    if (!label) return null;
    const parsedIn = parseTimeField(template.schedIn || "");
    const parsedOut = parseTimeField(template.schedOut || "");
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
      clearSchedule: false
    };
  };
  const normalizeAdminShiftTemplates = (templates) => {
    const seenIds = /* @__PURE__ */ new Set();
    return (Array.isArray(templates) ? templates : []).map((template, index) => normalizeAdminShiftTemplate(template, index)).filter((template) => {
      if (!template || seenIds.has(template.id)) return false;
      seenIds.add(template.id);
      return true;
    });
  };
  const getVisibleAdminShiftTemplates = (templates) => {
    return normalizeAdminShiftTemplates(templates);
  };
  const buildScheduleCellKey = (employeeName, dateValue) => {
    return `${normalizeDate(dateValue)}::${String(employeeName || "").trim()}`;
  };
  const getScheduleRowForEmployeeDate = (rows, employeeName, dateValue) => {
    const targetDate = normalizeDate(dateValue);
    const candidates = getEmployeeRows(rows, employeeName).filter(
      (row) => normalizeDate(row.date) === targetDate && !isEntryLocked(row) && !isTimeOffRow(row)
    );
    if (candidates.length === 0) return null;
    return candidates.find((row) => hasTimeValue(row.schedIn) || hasTimeValue(row.schedOut)) || candidates.find((row) => !hasTimeValue(row.timeIn) && !hasTimeValue(row.timeOut)) || candidates[0];
  };
  const getSavedScheduleRowForEmployeeDate = (rows, employeeName, dateValue) => {
    const targetDate = normalizeDate(dateValue);
    const candidates = getEmployeeRows(rows, employeeName).filter(
      (row) => normalizeDate(row.date) === targetDate && !isTimeOffRow(row)
    );
    if (candidates.length === 0) return null;
    return candidates.find((row) => hasTimeValue(row.schedIn) || hasTimeValue(row.schedOut)) || candidates.find((row) => !hasTimeValue(row.timeIn) && !hasTimeValue(row.timeOut)) || candidates[0];
  };
  const buildAdminScheduleDraftFromRow = (row, employeeName = "", dateValue = /* @__PURE__ */ new Date()) => {
    const parsedIn = parseTimeField(row?.schedIn || "");
    const parsedOut = parseTimeField(row?.schedOut || "");
    return {
      ...buildEmptyAdminScheduleForm(employeeName || row?.name || "", dateValue || row?.date || /* @__PURE__ */ new Date()),
      schedIn: parsedIn.time,
      schedInPeriod: parsedIn.period || "AM",
      schedOut: parsedOut.time,
      schedOutPeriod: parsedOut.period || "PM",
      scheduleStatus: normalizeAdminScheduleStatus(row?.scheduleStatus),
      clearSchedule: false,
      sourceRow: row || null
    };
  };
  const normalizeAdminScheduleDraftForComparison = (draft) => {
    if (!draft) {
      return {
        name: "",
        date: "",
        schedIn: "",
        schedOut: "",
        scheduleStatus: "",
        clearSchedule: false
      };
    }
    const normalizedSchedIn = String(draft.schedIn || "").trim();
    const normalizedSchedOut = String(draft.schedOut || "").trim();
    return {
      name: String(draft.name || "").trim(),
      date: normalizeDate(draft.date),
      schedIn: draft.clearSchedule ? "" : normalizedSchedIn,
      schedInPeriod: draft.clearSchedule || !normalizedSchedIn ? "" : String(draft.schedInPeriod || "").trim().toUpperCase(),
      schedOut: draft.clearSchedule ? "" : normalizedSchedOut,
      schedOutPeriod: draft.clearSchedule || !normalizedSchedOut ? "" : String(draft.schedOutPeriod || "").trim().toUpperCase(),
      scheduleStatus: draft.clearSchedule ? "" : normalizeAdminScheduleStatus(draft.scheduleStatus),
      clearSchedule: Boolean(draft.clearSchedule)
    };
  };
  const areAdminScheduleDraftsEquivalent = (a, b) => {
    const normalizedA = normalizeAdminScheduleDraftForComparison(a);
    const normalizedB = normalizeAdminScheduleDraftForComparison(b);
    return normalizedA.name === normalizedB.name && normalizedA.date === normalizedB.date && normalizedA.schedIn === normalizedB.schedIn && normalizedA.schedInPeriod === normalizedB.schedInPeriod && normalizedA.schedOut === normalizedB.schedOut && normalizedA.schedOutPeriod === normalizedB.schedOutPeriod && normalizedA.scheduleStatus === normalizedB.scheduleStatus && normalizedA.clearSchedule === normalizedB.clearSchedule;
  };
  const isExpectedScheduleCellCleared = (rows, payload) => {
    const row = getScheduleRowForEmployeeDate(rows, payload?.name, payload?.date);
    if (!row) return true;
    return !hasTimeValue(row.schedIn) && !hasTimeValue(row.schedOut) && !String(row.scheduleStatus || "").trim();
  };
  const parseEditHistory = (reasonText) => {
    if (!reasonText || typeof reasonText !== "string") return [];
    return reasonText.split(/\s*\|\s*(?=\[Edit )/g).map((chunk) => chunk.trim()).filter(Boolean).map((chunk) => {
      const match = chunk.match(/^\[Edit ([^\]]+)\]:\s*([\s\S]*)$/);
      if (match) {
        return {
          timestamp: match[1].trim(),
          note: match[2].trim()
        };
      }
      return { timestamp: "", note: chunk };
    });
  };
  const formatHistoryTimestamp = (rawTimestamp) => {
    if (!rawTimestamp || typeof rawTimestamp !== "string") return "";
    const parsed = new Date(rawTimestamp);
    if (isNaN(parsed.getTime())) return rawTimestamp.trim();
    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };
  const parseReasonCell = (reasonText) => {
    if (!reasonText || typeof reasonText !== "string") return [];
    const trimmed = reasonText.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          if (!item || typeof item !== "object") return null;
          const rawTimestamp = typeof item.t === "string" ? item.t : typeof item.timestamp === "string" ? item.timestamp : "";
          const note = typeof item.n === "string" ? item.n : typeof item.note === "string" ? item.note : "";
          const editor = typeof item.by === "string" ? item.by : typeof item.editor === "string" ? item.editor : typeof item.byName === "string" ? item.byName : "";
          if (!note.trim()) return null;
          return {
            timestamp: formatHistoryTimestamp(rawTimestamp),
            rawTimestamp,
            editor: editor.trim(),
            note: note.trim()
          };
        }).filter(Boolean);
      }
    } catch (_) {
    }
    return parseEditHistory(trimmed).map((entry) => ({
      timestamp: entry.timestamp,
      rawTimestamp: entry.timestamp,
      editor: "",
      note: entry.note
    }));
  };
  const PinPad = ({ pinInput, handlePinPress, handlePinBackspace, handlePinClear, selectedEmployee, onCancel }) => /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center h-full animate-fade-in relative py-2 md:py-3" }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 md:mb-5 text-center shrink-0" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl md:text-2xl font-bold font-poppins text-[#060606]" }, "Enter PIN")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-1.5 md:gap-2 mb-3 md:mb-5 h-7 md:h-9 shrink-0 items-center" }, [0, 1, 2, 3].map((i) => /* @__PURE__ */ React.createElement("div", { key: i, className: `w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-black transition-all ${i < pinInput.length ? "bg-[#38bdf8] scale-125" : "bg-gray-200"}` }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2 md:gap-3 w-48 sm:w-52 md:w-56 lg:w-60 shrink-0 shadow-safe-4" }, [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => /* @__PURE__ */ React.createElement("button", { key: num, onClick: () => handlePinPress(num.toString()), className: "brutal-btn pin-btn bg-white hover:bg-gray-50 text-lg md:text-xl flex items-center justify-center" }, num)), /* @__PURE__ */ React.createElement("button", { onClick: handlePinClear, className: "brutal-btn pin-btn bg-[#fde047] hover:bg-[#facc15] text-[#060606] text-[11px] md:text-sm uppercase tracking-wide flex items-center justify-center" }, "Clear"), /* @__PURE__ */ React.createElement("button", { onClick: () => handlePinPress("0"), className: "brutal-btn pin-btn bg-white hover:bg-gray-50 text-lg md:text-xl flex items-center justify-center" }, "0"), /* @__PURE__ */ React.createElement("button", { onClick: handlePinBackspace, className: "brutal-btn pin-btn bg-[#fb7185] hover:bg-[#f43f5e] text-white text-base md:text-lg flex items-center justify-center" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-backspace" }))), /* @__PURE__ */ React.createElement("button", { onClick: onCancel, className: "mt-3 md:mt-5 text-gray-500 hover:text-[#060606] font-bold flex items-center gap-2 px-4 py-2 transition-colors lg:hidden shrink-0 text-sm" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-arrow-left" }), " Back to Names"));
  const PersonalDashboard = ({
    personalData,
    startEdit,
    isFetchingLogs,
    actionAlertPlan,
    onClockAction,
    canClockIn,
    canClockOut,
    isSubmittingAction,
    roleLabel = ""
  }) => {
    const visibleData = filterTimesheetRowsUpToToday(personalData);
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-full animate-fade-in relative overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "content-safe-padding flex justify-between items-center mb-4 md:mb-6 shrink-0 pt-1" }, /* @__PURE__ */ React.createElement("div", null, roleLabel && /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, roleLabel), /* @__PURE__ */ React.createElement("h3", { className: `section-title ${roleLabel ? "mt-1" : ""}` }, "My Timesheet")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, isFetchingLogs && /* @__PURE__ */ React.createElement("span", { className: "card-meta text-[#38bdf8]" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-sync fa-spin mr-1" }), "Syncing..."))), actionAlertPlan && /* @__PURE__ */ React.createElement("div", { className: "content-safe-padding mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "section-card panel-content-card bg-[#fee2e2]" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-shield-alt text-[#dc2626] text-lg mt-0.5" }), /* @__PURE__ */ React.createElement("p", { className: "text-xs md:text-sm font-bold text-[#060606] leading-relaxed" }, actionAlertPlan.message)))), /* @__PURE__ */ React.createElement("div", { className: "content-safe-padding grid grid-cols-2 gap-3 mb-4 md:mb-5 shrink-0" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onClockAction("CLOCK_IN"),
        disabled: !canClockIn,
        className: `brutal-btn timesheet-action-button flex flex-col items-center justify-center ${!canClockIn ? "bg-gray-200 text-gray-500" : "bg-[#4ade80] hover:bg-[#22c55e]"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isSubmittingAction ? "fa-circle-notch spinner" : "fa-sign-in-alt"}` }),
      /* @__PURE__ */ React.createElement("span", null, isSubmittingAction ? "Saving..." : "Clock In")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onClockAction("CLOCK_OUT"),
        disabled: !canClockOut,
        className: `brutal-btn timesheet-action-button flex flex-col items-center justify-center ${!canClockOut ? "bg-gray-200 text-gray-500" : "bg-[#fb7185] hover:bg-[#f43f5e]"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isSubmittingAction ? "fa-circle-notch spinner" : "fa-sign-out-alt"}` }),
      /* @__PURE__ */ React.createElement("span", null, isSubmittingAction ? "Saving..." : "Clock Out")
    )), /* @__PURE__ */ React.createElement("div", { className: "content-safe-padding flex-1 overflow-y-auto no-scrollbar space-y-2 pb-4 pt-1" }, visibleData.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "p-8 text-center text-gray-400 font-bold text-sm md:text-lg border-2 border-dashed border-gray-300 rounded-xl" }, "No records found") : visibleData.map((row, idx) => {
      const dateObj = parseLocalDate(row.date);
      const dayName = isNaN(dateObj) ? "???" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = isNaN(dateObj) ? "??" : dateObj.getDate();
      const monthName = isNaN(dateObj) ? "???" : dateObj.toLocaleDateString("en-US", { month: "short" });
      const isLocked = isEntryLocked(row);
      const hasEdits = parseReasonCell(row.reason).length > 0;
      return /* @__PURE__ */ React.createElement("div", { key: idx, className: `timesheet-entry-row panel-row-surface flex flex-row ${isLocked ? "bg-gray-50 opacity-80" : "bg-white"}` }, /* @__PURE__ */ React.createElement("div", { className: `timesheet-entry-date-block flex flex-row items-center justify-center border-r-2 border-black shrink-0 ${isLocked ? "bg-gray-200" : "bg-[#e9d5ff]"}` }, /* @__PURE__ */ React.createElement("div", { className: "timesheet-entry-day font-bold font-poppins text-[#060606]" }, dayName), /* @__PURE__ */ React.createElement("div", { className: "timesheet-entry-number font-bold font-poppins text-[#060606]" }, dayNum), /* @__PURE__ */ React.createElement("div", { className: "timesheet-entry-month font-bold text-[#060606]" }, monthName)), /* @__PURE__ */ React.createElement("div", { className: "timesheet-entry-details flex-1 flex flex-col md:flex-row md:items-center justify-between relative" }, /* @__PURE__ */ React.createElement("div", { className: "timesheet-entry-grid flex-1 grid grid-cols-2 md:grid-cols-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React.createElement("span", { className: "timesheet-entry-label font-bold text-gray-500 uppercase" }, "In"), /* @__PURE__ */ React.createElement("span", { className: `timesheet-entry-value font-bold font-poppins ${isLocked ? "text-gray-600" : "text-[#10b981]"}` }, row.timeIn)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React.createElement("span", { className: "timesheet-entry-label font-bold text-gray-500 uppercase" }, "Out"), /* @__PURE__ */ React.createElement("span", { className: `timesheet-entry-value font-bold font-poppins ${isLocked ? "text-gray-600" : "text-[#f43f5e]"}` }, row.timeOut || "-")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React.createElement("span", { className: "timesheet-entry-label font-bold text-gray-500 uppercase" }, "Total"), /* @__PURE__ */ React.createElement("span", { className: "timesheet-entry-value font-bold font-poppins text-[#060606]" }, calculateHours(row.timeIn, row.timeOut)))), /* @__PURE__ */ React.createElement("div", { className: "absolute top-2 right-2 md:static md:flex items-center justify-center shrink-0" }, isLocked ? /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 p-2 flex items-center justify-center", title: "Pay period locked" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-lock text-sm md:text-lg" })) : /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("button", { onClick: () => startEdit(row), className: "brutal-btn timesheet-edit-button bg-[#fde047] flex items-center justify-center hover:bg-[#facc15]", title: "Edit Time" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-pencil-alt" })), hasEdits && /* @__PURE__ */ React.createElement("div", { className: "absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-[#f43f5e] border-2 border-black rounded-full", title: "Entry has notes/edits" })))));
    })));
  };
  const EditForm = ({ editTarget, editForm, setEditForm, saveEdit, reasonValidationTriggered, onPrev, onNext, canPrev, canNext, onClose, isSubmitting }) => {
    const historyRows = parseReasonCell(editForm.oldReason);
    const isReasonInvalid = reasonValidationTriggered && !editForm.newReason.trim();
    return /* @__PURE__ */ React.createElement("div", { className: "h-full flex flex-col animate-fade-in overflow-hidden relative" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 md:p-6 border-b-3 border-black flex flex-col md:flex-row justify-between items-center bg-[#fde047] gap-4 mb-4 md:mb-6 shrink-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold font-poppins text-[#060606] text-center md:text-left" }, "Edit Entry")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_#000000]" }, /* @__PURE__ */ React.createElement("button", { onClick: onPrev, disabled: !canPrev, className: `w-10 h-10 flex items-center justify-center rounded-lg text-[#060606] transition-colors font-bold font-poppins text-lg ${canPrev ? "hover:bg-gray-100" : "opacity-40 cursor-not-allowed"}` }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-chevron-left" })), /* @__PURE__ */ React.createElement("span", { className: "font-bold font-poppins text-[#060606] w-24 text-center text-lg" }, formatMonthDayDate(editTarget.date)), /* @__PURE__ */ React.createElement("button", { onClick: onNext, disabled: !canNext, className: `w-10 h-10 flex items-center justify-center rounded-lg text-[#060606] transition-colors font-bold font-poppins text-lg ${canNext ? "hover:bg-gray-100" : "opacity-40 cursor-not-allowed"}` }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-chevron-right" }))), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "brutal-btn w-12 h-12 bg-white flex items-center justify-center text-[#060606] hover:bg-gray-100 text-xl absolute md:relative top-4 right-4 md:top-auto md:right-auto" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-times" }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 md:space-y-4 flex-1 overflow-y-auto no-scrollbar pb-4 pt-1 px-4 md:px-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-1 md:mb-2" }, "Time In"), /* @__PURE__ */ React.createElement("div", { className: "w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-stretch focus-within:shadow-[4px_4px_0px_0px_#000000]" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        placeholder: "8:00",
        value: editForm.timeIn,
        onChange: (e) => {
          const next = normalizeTimeInputWithPeriod(e.target.value, editForm.timeInPeriod);
          setEditForm({ ...editForm, timeIn: next.time, timeInPeriod: next.period });
        },
        className: "flex-1 px-2.5 md:px-3 py-2.5 md:py-3 font-bold text-sm md:text-base bg-transparent outline-none",
        maxLength: 5
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "flex shrink-0 items-center gap-2 pr-2 md:pr-3" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setEditForm({ ...editForm, timeInPeriod: "AM" }),
        className: `text-xs md:text-sm font-bold transition-colors ${editForm.timeInPeriod === "AM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}`
      },
      "AM"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setEditForm({ ...editForm, timeInPeriod: "PM" }),
        className: `text-xs md:text-sm font-bold transition-colors ${editForm.timeInPeriod === "PM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}`
      },
      "PM"
    )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-1 md:mb-2" }, "Time Out"), /* @__PURE__ */ React.createElement("div", { className: "w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-stretch focus-within:shadow-[4px_4px_0px_0px_#000000]" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        placeholder: "5:00",
        value: editForm.timeOut,
        onChange: (e) => {
          const next = normalizeTimeInputWithPeriod(e.target.value, editForm.timeOutPeriod);
          setEditForm({ ...editForm, timeOut: next.time, timeOutPeriod: next.period });
        },
        className: "flex-1 px-2.5 md:px-3 py-2.5 md:py-3 font-bold text-sm md:text-base bg-transparent outline-none",
        maxLength: 5
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "flex shrink-0 items-center gap-2 pr-2 md:pr-3" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setEditForm({ ...editForm, timeOutPeriod: "AM" }),
        className: `text-xs md:text-sm font-bold transition-colors ${editForm.timeOutPeriod === "AM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}`
      },
      "AM"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setEditForm({ ...editForm, timeOutPeriod: "PM" }),
        className: `text-xs md:text-sm font-bold transition-colors ${editForm.timeOutPeriod === "PM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}`
      },
      "PM"
    ))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mb-3 md:mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2 text-xs md:text-sm font-bold font-poppins mb-1 md:mb-2 text-[#060606]" }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 bg-[#f43f5e] border border-black rounded-full" }), "Previous Edits"), /* @__PURE__ */ React.createElement("div", { className: "w-full p-3 md:p-4 border-2 border-black rounded-xl bg-gray-100 text-[#060606] font-bold text-xs md:text-sm min-h-[84px] max-h-[132px] overflow-y-auto no-scrollbar" }, historyRows.length > 0 ? /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, historyRows.map((entry, idx) => /* @__PURE__ */ React.createElement("div", { key: `${entry.timestamp}-${idx}`, className: "leading-snug break-words" }, entry.timestamp ? `${entry.timestamp}` : "", entry.timestamp && entry.editor ? " | " : "", entry.editor ? `${entry.editor}: ` : entry.timestamp ? ": " : "", entry.note || "-"))) : /* @__PURE__ */ React.createElement("div", { className: "text-gray-400 italic" }, "No previous edits"))), /* @__PURE__ */ React.createElement("label", { className: `block text-xs md:text-sm font-bold font-poppins mb-1 md:mb-2 ${isReasonInvalid ? "text-[#e11d48]" : "text-[#060606]"}` }, "Reason for Edit (Required)"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: editForm.newReason,
        onChange: (e) => setEditForm({ ...editForm, newReason: e.target.value }),
        className: `w-full p-3 md:p-4 font-bold text-sm md:text-base h-20 md:h-28 border-2 rounded-xl outline-none transition-colors placeholder:text-gray-400 ${isReasonInvalid ? "border-[#f43f5e] bg-white text-[#060606]" : "border-black bg-white text-[#060606]"}`,
        placeholder: "E.g., Forgot to clock in, System error..."
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "mt-2 md:mt-4 shrink-0 px-4 md:px-6 pb-4 md:pb-6" }, /* @__PURE__ */ React.createElement("button", { onClick: saveEdit, disabled: isSubmitting, className: "brutal-btn w-full bg-[#38bdf8] hover:bg-[#0ea5e9] py-2.5 md:py-3 text-sm md:text-base text-[#060606]" }, isSubmitting ? "Saving..." : "Save Changes")));
  };
  const EmployeeInventoryPanel = ({
    inventoryRows,
    isFetchingInventory,
    isSubmittingInventory,
    onRefresh,
    onStart,
    onFinish,
    onMessage
  }) => {
    const [drafts, setDrafts] = useState({});
    const openRows = sortInventoryRows(getOpenInventoryRows(inventoryRows));
    const updateDraft = (rowNumber, field, value) => {
      setDrafts((prev) => ({
        ...prev,
        [rowNumber]: {
          ...prev[rowNumber] || {},
          [field]: value
        }
      }));
    };
    const clearDraft = (rowNumber, field) => {
      setDrafts((prev) => ({
        ...prev,
        [rowNumber]: {
          ...prev[rowNumber] || {},
          [field]: ""
        }
      }));
    };
    const submitAction = async (row, field, submitter) => {
      const quantity = parseWholeNumber(drafts[row.rowNumber]?.[field]);
      if (!quantity) {
        onMessage?.({ type: "error", message: "Enter a whole number before saving inventory progress." });
        return;
      }
      const didSucceed = await submitter(row, quantity);
      if (didSucceed) {
        clearDraft(row.rowNumber, field);
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-full animate-fade-in overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "content-safe-padding flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 md:mb-6 shrink-0 pt-1 pb-1" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "section-title" }, "Inventory Board"), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, "Start work here, then move finished pieces into Awaiting Approval.")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 self-start md:self-auto" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onRefresh,
        disabled: isFetchingInventory || isSubmittingInventory,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isFetchingInventory ? "fa-circle-notch spinner" : "fa-rotate-right"} text-[#38bdf8]` }),
      /* @__PURE__ */ React.createElement("span", null, isFetchingInventory ? "Refreshing..." : "Refresh")
    ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4 pr-1" }, openRows.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "p-8 text-center text-gray-400 font-bold text-sm md:text-lg border-2 border-dashed border-gray-300 rounded-xl bg-white" }, "No active inventory needs right now.") : openRows.map((row) => /* @__PURE__ */ React.createElement("div", { key: row.rowNumber, className: "section-card panel-content-card" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-start md:justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-card-header" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-card-meta-block shrink-0 md:basis-[150px]" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-card-label" }, "SKU"), /* @__PURE__ */ React.createElement("div", { className: "inventory-card-sku mt-1" }, getInventorySkuText(row))), /* @__PURE__ */ React.createElement("div", { className: "inventory-card-meta-block min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-card-label" }, "Pen Name"), /* @__PURE__ */ React.createElement("h4", { className: "inventory-card-name mt-1" }, getInventoryNameText(row))))), /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center rounded-full border-2 border-black bg-[#fef3c7] px-3 py-1 text-xs font-bold uppercase tracking-wide" }, row.status)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-[#f5f3ff] px-3 py-2" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-label" }, "Needed"), /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-value text-lg" }, row.needed)), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-[#ecfccb] px-3 py-2" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-label" }, "In Process"), /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-value text-lg" }, row.inProcess)), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-[#fef3c7] px-3 py-2" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-label" }, "Awaiting Approval"), /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-value text-lg" }, row.awaitingApproval)), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-[#d1fae5] px-3 py-2" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-label" }, "Approved"), /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-value text-lg" }, row.addedToStore)), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-[#fee2e2] px-3 py-2" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-label" }, "Still Needed"), /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-value text-lg" }, row.stillNeeded))), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-2 gap-3 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-[#f0fdf4] p-3" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2" }, "Start Qty"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: "1",
        step: "1",
        value: drafts[row.rowNumber]?.start || "",
        onChange: (e) => updateDraft(row.rowNumber, "start", e.target.value),
        className: "brutal-input w-full px-3 py-2 text-sm",
        placeholder: row.stillNeeded > 0 ? `${row.stillNeeded} left` : "All covered"
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => submitAction(row, "start", onStart),
        disabled: isSubmittingInventory || row.stillNeeded <= 0,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-[#4ade80] hover:bg-[#22c55e]"
      },
      "Start"
    ))), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-[#fff7ed] p-3" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2" }, "Finish Qty"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: "1",
        step: "1",
        value: drafts[row.rowNumber]?.finish || "",
        onChange: (e) => updateDraft(row.rowNumber, "finish", e.target.value),
        className: "brutal-input w-full px-3 py-2 text-sm",
        placeholder: row.inProcess > 0 ? `${row.inProcess} in process` : "Nothing started"
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => submitAction(row, "finish", onFinish),
        disabled: isSubmittingInventory || row.inProcess <= 0,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-[#fb923c] hover:bg-[#f97316]"
      },
      "Finish"
    )))), /* @__PURE__ */ React.createElement("div", { className: "mt-3 text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wide" }, "Updated ", formatInventoryTimestamp(row.lastUpdated))))));
  };
  const PublishedSchedulePanel = ({
    sheetData,
    eyebrow = "",
    title = "Published Schedule",
    subtitle = "",
    highlightName = "",
    compact = false,
    weekCount = 3,
    allowTimeOffRequests = false,
    onSelectDate = null,
    isSubmittingTimeOff = false
  }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStartDate(/* @__PURE__ */ new Date()));
    const allRows = Array.isArray(sheetData) ? sheetData : [];
    const publishedRows = allRows.filter((row) => !isTimeOffRow(row) && (hasTimeValue(row.schedIn) || hasTimeValue(row.schedOut)) && isPublishedSchedule(row)).slice().sort((a, b) => {
      const dateCompare = normalizeDate(a.date).localeCompare(normalizeDate(b.date));
      if (dateCompare !== 0) return dateCompare;
      const timeCompare = (parseClockTimeToMinutes(a.schedIn) || 0) - (parseClockTimeToMinutes(b.schedIn) || 0);
      if (timeCompare !== 0) return timeCompare;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
    const normalizedHighlightName = String(highlightName || "").trim();
    const showTimeOffRequestHint = Boolean(allowTimeOffRequests && normalizedHighlightName && onSelectDate);
    const weeksToShow = compact ? Math.min(2, weekCount) : weekCount;
    const visibleWeeks = Array.from({ length: weeksToShow }).map((_, weekIndex) => {
      const startDate = addDaysToLocalDate(currentWeekStart, weekIndex * 7);
      const days = buildWeekDays(startDate);
      const weekStartKey = normalizeDate(startDate);
      const weekEndKey = normalizeDate(days[6]);
      const shiftCount = publishedRows.filter((row) => {
        const rowKey = normalizeDate(row.date);
        return rowKey >= weekStartKey && rowKey <= weekEndKey;
      }).length;
      return {
        startDate,
        days,
        shiftCount
      };
    });
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-full animate-fade-in overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-4 shrink-0 px-1 pt-1" }, /* @__PURE__ */ React.createElement("div", null, eyebrow && /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, eyebrow), /* @__PURE__ */ React.createElement("h3", { className: `section-title ${eyebrow ? "mt-1" : ""}` }, title), subtitle && /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, subtitle)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_#000000] h-12" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setCurrentWeekStart((prev) => addDaysToLocalDate(prev, -7)), className: "w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#060606] transition-colors font-bold font-poppins text-lg" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-chevron-left" })), /* @__PURE__ */ React.createElement("span", { className: "font-bold font-poppins text-[#060606] min-w-[170px] md:min-w-[210px] text-center text-sm md:text-base px-2" }, formatWeekRangeLabel(currentWeekStart)), /* @__PURE__ */ React.createElement("button", { onClick: () => setCurrentWeekStart((prev) => addDaysToLocalDate(prev, 7)), className: "w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#060606] transition-colors font-bold font-poppins text-lg" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-chevron-right" }))))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto no-scrollbar px-1 pb-4" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, visibleWeeks.map((week, weekIndex) => /* @__PURE__ */ React.createElement("div", { key: normalizeDate(week.startDate), className: "section-card panel-content-card bg-[#fffdf5]" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, "Week ", weekIndex + 1), /* @__PURE__ */ React.createElement("h4", { className: "card-title mt-1" }, formatWeekRangeLabel(week.startDate))), /* @__PURE__ */ React.createElement("div", { className: "text-left md:text-right" }, /* @__PURE__ */ React.createElement("div", { className: "card-meta" }, week.shiftCount, " published shift", week.shiftCount === 1 ? "" : "s"), showTimeOffRequestHint && /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1 text-[#38bdf8]" }, "Tap the date to request time off."))), /* @__PURE__ */ React.createElement("div", { className: "schedule-week-grid employee-schedule-grid" }, week.days.map((dayObj) => {
      const dayKey = normalizeDate(dayObj);
      const dayShifts = publishedRows.filter((row) => normalizeDate(row.date) === dayKey);
      const isToday = dayKey === normalizeDate(/* @__PURE__ */ new Date());
      const timeOffRow = normalizedHighlightName ? getTimeOffRowForEmployeeDate(allRows, normalizedHighlightName, dayKey) : null;
      const timeOffMeta = parseTimeOffMetadata(timeOffRow?.reason);
      const personalShift = normalizedHighlightName ? dayShifts.find((shift) => String(shift.name || "").trim() === normalizedHighlightName) : null;
      const canSelectDate = Boolean(
        allowTimeOffRequests && normalizedHighlightName && onSelectDate && (!isPastScheduleDate(dayKey) || timeOffRow)
      );
      const shouldShowPersonalCard = Boolean(timeOffRow || personalShift);
      const personalCardClass = timeOffRow ? isApprovedTimeOffRow(timeOffRow) ? "bg-[#fee2e2]" : "bg-[#fff7ed]" : personalShift ? "bg-[#dbeafe]" : "bg-[#f8fafc]";
      const personalCardTitle = timeOffRow ? getTimeOffStatusLabel(timeOffRow) : "Your shift";
      const personalCardValue = timeOffRow ? getTimeOffRangeLabel(timeOffRow, timeOffMeta) : personalShift ? `${personalShift.schedIn} - ${personalShift.schedOut}` : "";
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: dayKey,
          className: `section-card employee-schedule-day-card overflow-hidden ${isToday ? "bg-[#e0f2fe]" : "bg-white"}`
        },
        allowTimeOffRequests ? /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => canSelectDate && onSelectDate(dayKey),
            disabled: !canSelectDate,
            className: `w-full px-4 py-3 border-b-2 border-black text-left ${isToday ? "bg-[#38bdf8]" : "bg-[#f8fafc]"} ${canSelectDate ? "hover:bg-[#dbeafe]" : "cursor-default"}`
          },
          /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#060606]" }, dayObj.toLocaleDateString("en-US", { weekday: "short" })), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-1 whitespace-nowrap" }, formatShortDateLabel(dayObj)))
        ) : /* @__PURE__ */ React.createElement("div", { className: `px-4 py-3 border-b-2 border-black ${isToday ? "bg-[#38bdf8]" : "bg-[#f8fafc]"}` }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#060606]" }, dayObj.toLocaleDateString("en-US", { weekday: "short" })), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-1 whitespace-nowrap" }, formatShortDateLabel(dayObj))),
        /* @__PURE__ */ React.createElement("div", { className: "employee-schedule-shifts no-scrollbar p-3 space-y-2" }, normalizedHighlightName && shouldShowPersonalCard && /* @__PURE__ */ React.createElement("div", { className: `schedule-shift-card px-2.5 py-2.5 ${personalCardClass}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "card-title text-sm leading-tight" }, personalCardTitle), timeOffRow ? /* @__PURE__ */ React.createElement("span", { className: `status-chip px-2 py-1 text-[10px] ${isApprovedTimeOffRow(timeOffRow) ? "bg-[#fecaca]" : "bg-[#fde68a]"}` }, getTimeOffStatusLabel(timeOffRow)) : personalShift ? /* @__PURE__ */ React.createElement("span", { className: "status-chip bg-[#e0f2fe] px-2 py-1 text-[10px]" }, "You") : null), /* @__PURE__ */ React.createElement("div", { className: "card-meta employee-shift-time mt-1.5 text-[#060606]" }, personalCardValue), timeOffRow && timeOffMeta?.approvedBy && /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1" }, "Approved by ", timeOffMeta.approvedBy), timeOffRow && !timeOffMeta?.approvedBy && timeOffMeta?.requestedAt && /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1" }, "Requested ", formatHistoryTimestamp(timeOffMeta.requestedAt))), !shouldShowPersonalCard && dayShifts.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-dashed border-gray-300 bg-white px-3 py-5 text-center text-xs font-bold text-gray-400" }, "No published shifts."), dayShifts.length > 0 ? dayShifts.map((shift, index) => {
          const isHighlighted = normalizedHighlightName && String(shift.name || "").trim() === normalizedHighlightName;
          return /* @__PURE__ */ React.createElement(
            "div",
            {
              key: `${dayKey}-${shift.name}-${index}`,
              className: `schedule-shift-card px-2.5 py-2.5 ${isHighlighted ? "bg-[#dbeafe]" : "bg-white"}`
            },
            /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "card-title text-sm leading-tight" }, shift.name), isHighlighted && /* @__PURE__ */ React.createElement("span", { className: "status-chip bg-[#e0f2fe] px-2 py-1 text-[10px]" }, "You")),
            /* @__PURE__ */ React.createElement("div", { className: "card-meta employee-shift-time mt-1.5" }, shift.schedIn, " - ", shift.schedOut)
          );
        }) : null)
      );
    })))))));
  };
  const EmployeeTimeOffModal = ({
    employeeName,
    draft,
    setDraft,
    existingRow,
    onClose,
    onSubmit,
    isSubmitting
  }) => {
    if (!draft) return null;
    const existingMeta = parseTimeOffMetadata(existingRow?.reason);
    const isApproved = isApprovedTimeOffRow(existingRow);
    const isPending = isTimeOffRequestRow(existingRow);
    const formattedRange = formatTimeOffDraftRange(draft);
    const formattedIn = formatTimeField(draft.schedIn, draft.schedInPeriod);
    const formattedOut = formatTimeField(draft.schedOut, draft.schedOutPeriod);
    const hasValidHours = draft.fullDay || Boolean(formattedIn && formattedOut && calculateWorkedMinutes(formattedIn, formattedOut));
    const isPastDate = isPastScheduleDate(draft.date);
    const submitDisabled = isSubmitting || isApproved || isPastDate || !hasValidHours;
    return /* @__PURE__ */ React.createElement("div", { className: "editor-modal-backdrop", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "brutal-card editor-modal bg-white p-4 md:p-6", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-start md:justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "section-title" }, "Time Off Request"), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, employeeName, " - ", formatFullDate(draft.date))), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onClose,
        className: "brutal-btn bg-white px-4 py-2 text-sm md:text-base flex items-center gap-2 self-start"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-xmark" }),
      /* @__PURE__ */ React.createElement("span", null, "Close")
    )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "section-card bg-[#f8fafc] px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Requested Block"), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-2" }, formattedRange || "Choose full day or hours")), /* @__PURE__ */ React.createElement("div", { className: "section-card bg-[#f8fafc] px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Status"), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-2" }, isApproved ? "Approved" : isPending ? "Pending approval" : "Not submitted yet"), existingMeta?.approvedBy && /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1" }, "Approved by ", existingMeta.approvedBy))), /* @__PURE__ */ React.createElement("div", { className: "section-card bg-white p-4 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "card-title" }, "Request Details"), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, isApproved ? "This request is already approved. An admin will need to clear it before it can be changed." : "Choose a full day or enter the specific hours you need blocked out.")), existingRow && /* @__PURE__ */ React.createElement("div", { className: `status-chip ${isApproved ? "bg-[#fecaca]" : "bg-[#fde68a]"}` }, getTimeOffStatusLabel(existingRow))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3 mt-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: isApproved,
        onClick: () => setDraft((prev) => ({ ...prev, fullDay: true })),
        className: `brutal-btn px-4 py-3 text-sm md:text-base ${draft.fullDay ? "bg-[#38bdf8]" : "bg-white hover:bg-gray-50"}`
      },
      "Full Day"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: isApproved,
        onClick: () => setDraft((prev) => ({ ...prev, fullDay: false })),
        className: `brutal-btn px-4 py-3 text-sm md:text-base ${!draft.fullDay ? "bg-[#38bdf8]" : "bg-white hover:bg-gray-50"}`
      },
      "Specific Hours"
    )), !draft.fullDay && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 items-end mt-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "field-label block mb-2" }, "Block Starting"), /* @__PURE__ */ React.createElement("div", { className: "w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-center gap-3 px-3 focus-within:shadow-[4px_4px_0px_0px_#000000] transition-shadow" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        placeholder: "9:00",
        value: draft.schedIn,
        onChange: (e) => {
          const next = normalizeTimeInputWithPeriod(e.target.value, draft.schedInPeriod);
          setDraft((prev) => ({
            ...prev,
            schedIn: next.time,
            schedInPeriod: next.period
          }));
        },
        disabled: isApproved,
        className: "w-[5ch] min-w-[5ch] py-3 font-bold text-sm md:text-base bg-transparent outline-none disabled:opacity-50",
        maxLength: 5
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "ml-auto flex shrink-0 items-center gap-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", disabled: isApproved, onClick: () => setDraft((prev) => ({ ...prev, schedInPeriod: "AM" })), className: `text-xs md:text-sm font-bold ${draft.schedInPeriod === "AM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}` }, "AM"), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: isApproved, onClick: () => setDraft((prev) => ({ ...prev, schedInPeriod: "PM" })), className: `text-xs md:text-sm font-bold ${draft.schedInPeriod === "PM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}` }, "PM")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "field-label block mb-2" }, "Block Ending"), /* @__PURE__ */ React.createElement("div", { className: "w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-center gap-3 px-3 focus-within:shadow-[4px_4px_0px_0px_#000000] transition-shadow" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        placeholder: "5:00",
        value: draft.schedOut,
        onChange: (e) => {
          const next = normalizeTimeInputWithPeriod(e.target.value, draft.schedOutPeriod);
          setDraft((prev) => ({
            ...prev,
            schedOut: next.time,
            schedOutPeriod: next.period
          }));
        },
        disabled: isApproved,
        className: "w-[5ch] min-w-[5ch] py-3 font-bold text-sm md:text-base bg-transparent outline-none disabled:opacity-50",
        maxLength: 5
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "ml-auto flex shrink-0 items-center gap-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", disabled: isApproved, onClick: () => setDraft((prev) => ({ ...prev, schedOutPeriod: "AM" })), className: `text-xs md:text-sm font-bold ${draft.schedOutPeriod === "AM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}` }, "AM"), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: isApproved, onClick: () => setDraft((prev) => ({ ...prev, schedOutPeriod: "PM" })), className: `text-xs md:text-sm font-bold ${draft.schedOutPeriod === "PM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}` }, "PM"))))), isPastDate && /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-3 text-[#e11d48]" }, "Past dates can\xE2\u20AC\u2122t be requested from this screen."), !draft.fullDay && !hasValidHours && !isApproved && /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-3 text-[#e11d48]" }, "Enter a valid start and end time to request a partial-day block.")), /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex flex-col md:flex-row gap-3 md:justify-end" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onClose,
        className: "brutal-btn bg-white px-4 py-3 text-sm md:text-base"
      },
      "Cancel"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onSubmit,
        disabled: submitDisabled,
        className: "brutal-btn bg-[#4ade80] hover:bg-[#22c55e] px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isSubmitting ? "fa-circle-notch spinner" : "fa-paper-plane"}` }),
      /* @__PURE__ */ React.createElement("span", null, isSubmitting ? "Sending..." : isPending ? "Update Request" : "Submit Request")
    ))));
  };
  const TodaySchedulePanel = ({
    sheetData,
    eyebrow = "",
    title = "Schedule",
    subtitle = ""
  }) => {
    const todayKey = normalizeDate(/* @__PURE__ */ new Date());
    const todayShifts = getTodayPublishedShifts(sheetData);
    const scheduleColumnCount = Math.min(Math.max(todayShifts.length, 1), 4);
    const scheduleGridWidth = `${scheduleColumnCount * STANDARD_SIZE_UNIT + (scheduleColumnCount - 1) * STANDARD_SIZE_GAP}px`;
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-auto min-h-0 animate-fade-in" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-3 mb-3 shrink-0" }, /* @__PURE__ */ React.createElement("div", null, eyebrow && /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, eyebrow), /* @__PURE__ */ React.createElement("h3", { className: `section-title ${eyebrow ? "mt-1" : ""}` }, title), subtitle && /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, subtitle)), /* @__PURE__ */ React.createElement("div", { className: "status-chip bg-[#e0f2fe] self-start" }, todayShifts.length, " ", todayShifts.length === 1 ? "shift" : "shifts")), /* @__PURE__ */ React.createElement("div", { className: "public-schedule-wrap shadow-safe-2", style: { width: `min(100%, ${scheduleGridWidth})` } }, todayShifts.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400" }, "No published shifts.") : /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "public-schedule-grid",
        style: { width: `min(100%, ${scheduleGridWidth})` }
      },
      todayShifts.map((shift, idx) => /* @__PURE__ */ React.createElement(
        "div",
        {
          key: `${todayKey}-${shift.name}-${idx}`,
          className: "public-schedule-shift-card flex flex-col gap-2"
        },
        /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "public-schedule-name", title: shift.name }, shift.name)),
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "public-schedule-time-pill" }, shift.schedIn, " - ", shift.schedOut))
      ))
    )));
  };
  const InventorySnapshotPanel = ({
    inventoryRows,
    eyebrow = "",
    title = "Inventory Snapshot",
    subtitle = ""
  }) => {
    const { openRows, totals } = buildInventorySnapshotSummary(inventoryRows);
    const inventorySubtitle = subtitle || "Active needs grouped into one quick summary.";
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-auto min-h-0 animate-fade-in" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 shrink-0" }, /* @__PURE__ */ React.createElement("div", null, eyebrow && /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#f97316]" }, eyebrow), /* @__PURE__ */ React.createElement("h3", { className: `section-title ${eyebrow ? "mt-1" : ""}` }, title), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, inventorySubtitle)), /* @__PURE__ */ React.createElement("div", { className: "status-chip bg-[#fef3c7] self-start md:self-auto" }, openRows.length, " open")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2.5 mb-3 shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "public-summary-row bg-[#f0fdf4]" }, /* @__PURE__ */ React.createElement("div", { className: "text-[9px] uppercase font-bold text-gray-500" }, "Still Needed"), /* @__PURE__ */ React.createElement("div", { className: "font-bold font-poppins text-lg text-[#060606] mt-1" }, totals.stillNeeded)), /* @__PURE__ */ React.createElement("div", { className: "public-summary-row bg-[#ecfccb]" }, /* @__PURE__ */ React.createElement("div", { className: "text-[9px] uppercase font-bold text-gray-500" }, "In Process"), /* @__PURE__ */ React.createElement("div", { className: "font-bold font-poppins text-lg text-[#060606] mt-1" }, totals.inProcess)), /* @__PURE__ */ React.createElement("div", { className: "public-summary-row bg-[#fff7ed]" }, /* @__PURE__ */ React.createElement("div", { className: "text-[9px] uppercase font-bold text-gray-500" }, "Awaiting"), /* @__PURE__ */ React.createElement("div", { className: "font-bold font-poppins text-lg text-[#060606] mt-1" }, totals.awaitingApproval))), /* @__PURE__ */ React.createElement("div", { className: "message-thread-scroll-auto no-scrollbar shadow-safe-2" }, openRows.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400 bg-white" }, "No open inventory tasks right now.") : /* @__PURE__ */ React.createElement("div", { className: "space-y-2.5" }, openRows.map((row) => /* @__PURE__ */ React.createElement("div", { key: row.rowNumber, className: "public-summary-row flex items-start justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-card-sku", title: getInventorySkuText(row) }, getInventorySkuText(row)), /* @__PURE__ */ React.createElement("div", { className: "font-bold font-poppins text-[#060606] text-sm leading-tight mt-1 break-words" }, getInventoryNameText(row)), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-2" }, "Updated ", formatInventoryTimestamp(row.lastUpdated))), /* @__PURE__ */ React.createElement("div", { className: "inventory-status-chip shrink-0 rounded-full border-2 border-black bg-[#fef3c7] font-bold uppercase text-center text-[#060606]" }, row.status))))));
  };
  const PenHospitalOverviewPanel = ({
    penHospitalCases,
    eyebrow = "",
    title = "Pen Hospital Overview",
    subtitle = ""
  }) => {
    const summary = buildPenHospitalSummary(penHospitalCases).filter((section) => section.key !== "completed").map((section) => ({
      ...section,
      displayTitle: section.key === "ready" ? "Ready" : section.title
    }));
    const activeCount = summary.reduce((sum, section) => sum + section.count, 0);
    const overviewSubtitle = subtitle || "Repair queue counts by lane.";
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-auto min-h-0 animate-fade-in" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 shrink-0" }, /* @__PURE__ */ React.createElement("div", null, eyebrow && /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#0f766e]" }, eyebrow), /* @__PURE__ */ React.createElement("h3", { className: `section-title ${eyebrow ? "mt-1" : ""}` }, title), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, overviewSubtitle)), /* @__PURE__ */ React.createElement("div", { className: "status-chip bg-[#ccfbf1] self-start md:self-auto" }, activeCount, " active")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2.5" }, summary.map((section) => /* @__PURE__ */ React.createElement("div", { key: section.key, className: `public-summary-row ${section.countClass}` }, /* @__PURE__ */ React.createElement("div", { className: "text-[9px] uppercase font-bold text-gray-500" }, section.displayTitle), /* @__PURE__ */ React.createElement("div", { className: "font-bold font-poppins text-lg text-[#060606] mt-1" }, section.count)))));
  };
  const MessageBoardPanel = ({
    messages,
    title = "Messages",
    eyebrow = "Message Board",
    subtitle = "",
    viewerName = "",
    viewerRole = "",
    draft = "",
    onDraftChange,
    onSend,
    onRefresh,
    onReact,
    canCompose = false,
    isFetching = false,
    isSubmitting = false,
    reactingRowNumber = null,
    readOnly = false,
    newestFirst = false,
    autoHeight = false,
    maxMessages = null
  }) => {
    const threadEndRef = useRef(null);
    const threadScrollRef = useRef(null);
    const [activeReactionMessageRow, setActiveReactionMessageRow] = useState(null);
    const normalizedViewerName = String(viewerName || "").trim().toLowerCase();
    const safeMessages = Array.isArray(messages) ? messages : [];
    const displayedMessages = (newestFirst ? [...safeMessages].reverse() : safeMessages).slice(0, maxMessages || void 0);
    const trimmedDraft = normalizeMessageText(draft);
    const canReact = !readOnly && Boolean(normalizedViewerName) && typeof onReact === "function";
    useEffect(() => {
      if (newestFirst && threadScrollRef.current) {
        threadScrollRef.current.scrollTop = 0;
        return;
      }
      if (threadEndRef.current) {
        threadEndRef.current.scrollIntoView({ block: "end" });
      }
    }, [safeMessages.length, newestFirst]);
    useEffect(() => {
      if (!activeReactionMessageRow) return;
      const hasActiveMessage = safeMessages.some((message) => message?.rowNumber === activeReactionMessageRow);
      if (!hasActiveMessage) {
        setActiveReactionMessageRow(null);
      }
    }, [safeMessages, activeReactionMessageRow]);
    const toggleReactionPicker = (rowNumber) => {
      if (!canReact || !rowNumber) return;
      setActiveReactionMessageRow((prev) => prev === rowNumber ? null : rowNumber);
    };
    const handleReactionKeyDown = (event, rowNumber) => {
      if (!canReact || !rowNumber) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleReactionPicker(rowNumber);
      }
    };
    const handleReactionSelect = async (event, message, reactionKey) => {
      event.stopPropagation();
      if (!canReact || !message?.rowNumber) return;
      const didSave = await onReact(message, reactionKey);
      if (didSave) {
        setActiveReactionMessageRow(null);
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: `section-width flex flex-col min-h-0 animate-fade-in ${autoHeight ? "h-auto pr-0 pb-0" : "h-full pr-2 pb-2"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3 shrink-0 pr-1 pb-1" }, /* @__PURE__ */ React.createElement("div", null, eyebrow && /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#ec4899]" }, eyebrow), /* @__PURE__ */ React.createElement("h3", { className: `section-title ${eyebrow ? "mt-1" : ""}` }, title), subtitle && /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, subtitle)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2 self-start justify-end" }, !readOnly && onRefresh && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onRefresh,
        disabled: isFetching || isSubmitting,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isFetching ? "fa-circle-notch spinner" : "fa-rotate-right"} text-[#ec4899]` }),
      /* @__PURE__ */ React.createElement("span", null, isFetching ? "Refreshing..." : "Refresh")
    ))), /* @__PURE__ */ React.createElement("div", { ref: threadScrollRef, className: `${autoHeight ? "message-thread-scroll-auto" : "message-thread-scroll"} no-scrollbar shadow-safe-2 ${autoHeight ? "" : "pb-2"}` }, safeMessages.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400" }, "No notes yet.") : /* @__PURE__ */ React.createElement("div", { className: `message-thread ${autoHeight ? "message-thread-auto" : ""}` }, displayedMessages.map((message, index) => {
      const senderName = String(message?.senderName || "").trim() || "Unknown";
      const senderRole = normalizeMessageRole(message?.senderRole);
      const normalizedSenderName = senderName.toLowerCase();
      const isOwnMessage = Boolean(normalizedViewerName) && normalizedSenderName === normalizedViewerName;
      const reactions = sanitizeMessageReactions(message?.reactions);
      const reactionSummary = getMessageReactionSummary(reactions);
      const viewerReaction = getViewerMessageReaction(reactions, viewerName, viewerRole);
      const isReactionPickerOpen = canReact && activeReactionMessageRow === message?.rowNumber;
      const isReactionPending = reactingRowNumber === message?.rowNumber;
      const alignRight = isOwnMessage || !normalizedViewerName && senderRole === "admin";
      const bubbleTone = isOwnMessage ? "message-bubble-own" : senderRole === "admin" ? "message-bubble-admin" : "message-bubble-staff";
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: `${message?.rowNumber || "msg"}-${index}`,
          className: `message-row ${alignRight ? "message-row-right" : "message-row-left"}`
        },
        /* @__PURE__ */ React.createElement(
          "div",
          {
            className: `message-bubble ${bubbleTone} ${canReact && message?.rowNumber ? "message-bubble-interactive" : ""} ${isReactionPickerOpen ? "message-bubble-active" : ""}`,
            role: canReact && message?.rowNumber ? "button" : void 0,
            tabIndex: canReact && message?.rowNumber ? 0 : void 0,
            onClick: () => toggleReactionPicker(message?.rowNumber),
            onKeyDown: (event) => handleReactionKeyDown(event, message?.rowNumber),
            "aria-label": canReact && message?.rowNumber ? `React to message from ${senderName}` : void 0
          },
          /* @__PURE__ */ React.createElement("div", { className: "message-author mb-2" }, senderName),
          /* @__PURE__ */ React.createElement("div", { className: "message-text" }, message?.message || ""),
          reactionSummary.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "message-reaction-strip" }, reactionSummary.map((reaction) => /* @__PURE__ */ React.createElement(
            "div",
            {
              key: `${message?.rowNumber || "msg"}-${reaction.key}`,
              className: `message-reaction-pill ${viewerReaction === reaction.key ? "message-reaction-pill-active" : ""}`,
              title: reaction.names.join(", ")
            },
            /* @__PURE__ */ React.createElement("i", { className: `fas ${reaction.icon}` }),
            /* @__PURE__ */ React.createElement("span", null, reaction.count)
          ))),
          isReactionPickerOpen && /* @__PURE__ */ React.createElement("div", { className: "message-reaction-picker" }, MESSAGE_REACTION_OPTIONS.map((option) => {
            const isSelected = viewerReaction === option.key;
            return /* @__PURE__ */ React.createElement(
              "button",
              {
                key: `${message?.rowNumber || "msg"}-${option.key}`,
                type: "button",
                onClick: (event) => handleReactionSelect(event, message, option.key),
                disabled: isReactionPending,
                className: `message-reaction-button ${isSelected ? "message-reaction-button-active" : ""}`,
                "aria-label": option.label,
                title: option.label
              },
              /* @__PURE__ */ React.createElement("i", { className: `fas ${option.icon}` })
            );
          })),
          /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-3" }, formatMessageTimestamp(message?.timestamp, message?.isoTimestamp))
        )
      );
    }), /* @__PURE__ */ React.createElement("div", { ref: threadEndRef }))), !readOnly && canCompose && /* @__PURE__ */ React.createElement("div", { className: "mt-3 pt-3 border-t-2 border-black/10 shrink-0" }, /* @__PURE__ */ React.createElement("label", { className: "field-label block mb-2" }, "Leave A Note"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: draft,
        onChange: (e) => onDraftChange?.(String(e.target.value || "").slice(0, MESSAGE_MAX_LENGTH)),
        onKeyDown: (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && trimmedDraft && !isSubmitting) {
            e.preventDefault();
            onSend?.();
          }
        },
        rows: 4,
        maxLength: MESSAGE_MAX_LENGTH,
        placeholder: "Share a note about time off, inventory, supplies, or anything the admin team should see.",
        className: "brutal-input w-full px-4 py-3 text-sm md:text-base resize-none"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pr-1 pb-1" }, /* @__PURE__ */ React.createElement("div", { className: "card-meta" }, trimmedDraft.length, "/", MESSAGE_MAX_LENGTH, " characters. Press Ctrl+Enter to send."), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onSend,
        disabled: isSubmitting || !trimmedDraft,
        className: "brutal-btn bg-[#f9a8d4] hover:bg-[#f472b6] px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isSubmitting ? "fa-circle-notch spinner" : "fa-paper-plane"}` }),
      /* @__PURE__ */ React.createElement("span", null, isSubmitting ? "Sending..." : "Send Note")
    ))));
  };
  const PenHospitalCaseCard = ({
    caseRow,
    currentUser,
    isSubmitting = false,
    onUpdateStatus
  }) => {
    const currentRole = currentUser?.role || "employee";
    const currentStatus = normalizePenHospitalStatus(caseRow?.status);
    const penNames = String(caseRow?.penNames || "").trim();
    const diagnosis = String(caseRow?.diagnosis || caseRow?.diagnosisNotes || "").trim();
    const lastUpdatedLabel = caseRow?.lastUpdated || caseRow?.createdAt || "";
    const lastUpdatedIso = caseRow?.lastUpdatedIso || caseRow?.createdAtIso || "";
    const canEditStatuses = Boolean(currentUser && typeof onUpdateStatus === "function");
    const availableStatuses = PEN_HOSPITAL_STATUS_OPTIONS.filter((option) => canUserSetPenHospitalStatus(currentRole, option.value));
    return /* @__PURE__ */ React.createElement("div", { className: "section-card panel-content-card" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-bold tracking-[0.2em] text-[#0f766e]" }, "Customer"), /* @__PURE__ */ React.createElement("h4", { className: "text-lg md:text-xl font-bold font-poppins text-[#060606] mt-1 break-words" }, String(caseRow?.customerName || "").trim() || "Unnamed customer"), /* @__PURE__ */ React.createElement("div", { className: "text-sm font-bold text-gray-600 mt-2" }, formatPenHospitalExpectedLabel(caseRow))), /* @__PURE__ */ React.createElement("div", { className: `inline-flex items-center rounded-full border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#060606] ${getPenHospitalStatusChipClasses(currentStatus)}` }, currentStatus)), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-2 gap-3 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-[#f8fafc] px-3 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-bold tracking-wide text-gray-500" }, "Pen Names"), /* @__PURE__ */ React.createElement("div", { className: "text-sm md:text-base font-bold font-poppins text-[#060606] mt-1 break-words" }, penNames || "Pen names were not listed for this return.")), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-[#f8fafc] px-3 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-bold tracking-wide text-gray-500" }, "Diagnosis"), /* @__PURE__ */ React.createElement("div", { className: "text-sm md:text-base font-bold font-poppins text-[#060606] mt-1 break-words" }, diagnosis || "Diagnosis was not listed for this return."))), lastUpdatedLabel && /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-3" }, "Updated ", formatPenHospitalTimestamp(lastUpdatedLabel, lastUpdatedIso)), canEditStatuses && availableStatuses.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-bold tracking-wide text-gray-500" }, "Update Status"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 xl:grid-cols-3 gap-2 mt-2" }, availableStatuses.map((option) => {
      const isActive = currentStatus === option.value;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: `${caseRow?.rowNumber || "case"}-${option.value}`,
          type: "button",
          onClick: () => !isActive && onUpdateStatus?.(caseRow, option.value),
          disabled: isSubmitting || isActive,
          className: `brutal-btn px-3 py-2 text-[11px] md:text-xs leading-tight ${isActive ? `${getPenHospitalStatusChipClasses(option.value)} text-[#060606]` : "bg-white hover:bg-gray-50"}`
        },
        option.label
      );
    }))));
  };
  const PenHospitalBoard = ({
    penHospitalCases,
    currentUser,
    isSubmitting = false,
    onUpdateStatus,
    emptyMessage = "No Pen Hospital cases yet."
  }) => {
    const sortedCases = sortPenHospitalCases(penHospitalCases);
    const summary = buildPenHospitalSummary(sortedCases);
    if (sortedCases.length === 0) {
      return /* @__PURE__ */ React.createElement("div", { className: "h-full min-h-[360px] rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm md:text-base font-bold text-gray-400 flex items-center justify-center" }, emptyMessage);
    }
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 xl:grid-cols-4 gap-2.5" }, summary.map((section) => /* @__PURE__ */ React.createElement("div", { key: section.key, className: `public-summary-row ${section.countClass}` }, /* @__PURE__ */ React.createElement("div", { className: "text-[9px] uppercase font-bold text-gray-500" }, section.title), /* @__PURE__ */ React.createElement("div", { className: "font-bold font-poppins text-lg text-[#060606] mt-1" }, section.count)))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, PEN_HOSPITAL_BOARD_SECTIONS.map((section) => {
      const sectionCases = sortedCases.filter((caseRow) => getPenHospitalBoardKey(caseRow?.status) === section.key);
      return /* @__PURE__ */ React.createElement("div", { key: section.key, className: `brutal-card ${section.cardClass} p-4 md:p-5` }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "card-title" }, section.title), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, section.subtitle)), /* @__PURE__ */ React.createElement("div", { className: `status-chip self-start ${section.countClass}` }, sectionCases.length, " case", sectionCases.length === 1 ? "" : "s")), sectionCases.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm font-bold text-gray-400" }, "No cases in this lane.") : /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, sectionCases.map((caseRow) => /* @__PURE__ */ React.createElement(
        PenHospitalCaseCard,
        {
          key: caseRow.rowNumber,
          caseRow,
          currentUser,
          isSubmitting,
          onUpdateStatus
        }
      ))));
    })));
  };
  const EmployeePenHospitalPanel = ({
    penHospitalCases,
    currentUser,
    isFetchingPenHospital,
    isSubmittingPenHospital,
    onRefresh,
    onUpdateStatus
  }) => {
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-full animate-fade-in overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4 shrink-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "section-title" }, "Pen Hospital"), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, "Track inbound repairs, surgery status, and what is ready to head back to the customer.")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onRefresh,
        disabled: isFetchingPenHospital || isSubmittingPenHospital,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isFetchingPenHospital ? "fa-circle-notch spinner" : "fa-rotate-right"} text-[#0f766e]` }),
      /* @__PURE__ */ React.createElement("span", null, isFetchingPenHospital ? "Refreshing..." : "Refresh")
    ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto no-scrollbar pr-1 pb-4" }, /* @__PURE__ */ React.createElement(
      PenHospitalBoard,
      {
        penHospitalCases,
        currentUser,
        isSubmitting: isSubmittingPenHospital,
        onUpdateStatus,
        emptyMessage: "No Pen Hospital cases are active yet."
      }
    )));
  };
  const AdminPenHospitalWorkspace = ({
    adminUser,
    penHospitalCases,
    isFetchingPenHospital,
    isSubmittingPenHospital,
    onRefresh,
    onCreateCase,
    onUpdateStatus,
    onMessage
  }) => {
    const [createForm, setCreateForm] = useState({
      customerName: "",
      expectedCount: "",
      diagnosis: "",
      penNames: ""
    });
    const submitCreate = async () => {
      const customerName = String(createForm.customerName || "").trim();
      const expectedCount = parseWholeNumber(createForm.expectedCount);
      const diagnosis = String(createForm.diagnosis || "").trim();
      const penNames = String(createForm.penNames || "").trim();
      if (!customerName || !expectedCount) {
        onMessage?.({ type: "error", message: "Enter the customer name and a whole-number expected pen count." });
        return;
      }
      const didSucceed = await onCreateCase(customerName, expectedCount, diagnosis, penNames);
      if (didSucceed) {
        setCreateForm({
          customerName: "",
          expectedCount: "",
          diagnosis: "",
          penNames: ""
        });
      }
    };
    const roleLabel = formatRoleLabel(adminUser?.role, "Admin");
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-full animate-fade-in overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-4 shrink-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#0f766e]" }, roleLabel), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl md:text-3xl font-bold font-poppins text-[#060606] mt-1" }, "Pen Hospital")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onRefresh,
        disabled: isFetchingPenHospital || isSubmittingPenHospital,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isFetchingPenHospital ? "fa-circle-notch spinner" : "fa-rotate-right"} text-[#0f766e]` }),
      /* @__PURE__ */ React.createElement("span", null, isFetchingPenHospital ? "Refreshing..." : "Refresh")
    ))), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[360px_minmax(0,1fr)] gap-4 min-h-0 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "brutal-card bg-white p-4 md:p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-lg font-bold font-poppins text-[#060606]" }, "Open A Case"), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-gray-500 mt-1" }, "Admins start each repair case here. New cases begin as diagnosed.")), /* @__PURE__ */ React.createElement("div", { className: "surface-rounded border-2 border-black bg-[#ccfbf1] px-3 py-1 text-xs font-bold uppercase" }, penHospitalCases.length, " total")), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 mt-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2" }, "Customer Name"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: createForm.customerName,
        onChange: (e) => setCreateForm((prev) => ({ ...prev, customerName: e.target.value })),
        className: "brutal-input w-full px-3 py-2 text-sm",
        placeholder: "Who sent the pens in?"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2" }, "Pens Expected"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: "1",
        step: "1",
        value: createForm.expectedCount,
        onChange: (e) => setCreateForm((prev) => ({ ...prev, expectedCount: e.target.value })),
        className: "brutal-input w-full px-3 py-2 text-sm",
        placeholder: "How many pens are coming in?"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2" }, "Diagnosis"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: createForm.diagnosis,
        onChange: (e) => setCreateForm((prev) => ({ ...prev, diagnosis: String(e.target.value || "").slice(0, 300) })),
        className: "brutal-input w-full px-3 py-2 text-sm",
        placeholder: "What are we expecting to repair?"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2" }, "Pen Names (Optional)"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: createForm.penNames,
        onChange: (e) => setCreateForm((prev) => ({ ...prev, penNames: String(e.target.value || "").slice(0, 600) })),
        rows: 2,
        className: "brutal-input w-full min-h-[88px] px-3 py-2 text-sm resize-none",
        placeholder: "List pen names, one per line or separated by commas."
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: submitCreate,
        disabled: isSubmittingPenHospital,
        className: "brutal-btn w-full bg-[#2dd4bf] hover:bg-[#14b8a6] px-4 py-3 text-sm flex items-center justify-center gap-2"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isSubmittingPenHospital ? "fa-circle-notch spinner" : "fa-suitcase-medical"}` }),
      /* @__PURE__ */ React.createElement("span", null, isSubmittingPenHospital ? "Saving..." : "Create Case")
    )))), /* @__PURE__ */ React.createElement("div", { className: "min-h-0 flex flex-col overflow-y-auto no-scrollbar pr-1 pb-4" }, /* @__PURE__ */ React.createElement(
      PenHospitalBoard,
      {
        penHospitalCases,
        currentUser: adminUser,
        isSubmitting: isSubmittingPenHospital,
        onUpdateStatus,
        emptyMessage: "No Pen Hospital cases have been created yet."
      }
    ))));
  };
  const PublicOverviewPanel = ({ sheetData, inventoryRows, penHospitalCases, messages }) => {
    return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col h-full animate-fade-in overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "mb-4 md:mb-6 shrink-0" }, /* @__PURE__ */ React.createElement("h2", { className: "page-title" }, "Today at a Glance")), /* @__PURE__ */ React.createElement("div", { className: "min-h-0 flex-1 overflow-y-auto no-scrollbar shadow-safe-4 pt-1 pb-4 pr-2" }, /* @__PURE__ */ React.createElement("div", { className: "public-overview-masonry" }, /* @__PURE__ */ React.createElement("div", { className: "public-overview-left-column" }, /* @__PURE__ */ React.createElement("div", { className: "section-card public-overview-card public-overview-inventory-card bg-[#fff7ed] p-3 md:p-4" }, /* @__PURE__ */ React.createElement(
      InventorySnapshotPanel,
      {
        inventoryRows,
        title: "Inventory Snapshot"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "section-card public-overview-card public-overview-pen-hospital-card bg-[#f0fdfa] p-3 md:p-4" }, /* @__PURE__ */ React.createElement(
      PenHospitalOverviewPanel,
      {
        penHospitalCases
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "public-overview-right-column" }, /* @__PURE__ */ React.createElement("div", { className: "section-card public-overview-card public-overview-schedule-card bg-[#f8fafc] p-3 md:p-4" }, /* @__PURE__ */ React.createElement(TodaySchedulePanel, { sheetData })), /* @__PURE__ */ React.createElement("div", { className: "section-card public-overview-card public-overview-message-card bg-[#fdf2f8] p-3 md:p-4" }, /* @__PURE__ */ React.createElement(
      MessageBoardPanel,
      {
        messages,
        eyebrow: "",
        title: "Messages",
        subtitle: "Read-only view of the shared staff notes board.",
        readOnly: true,
        newestFirst: true,
        autoHeight: true,
        maxMessages: 5
      }
    ))))));
  };
  const AdminInventoryWorkspace = ({
    adminUser,
    inventoryRows,
    isFetchingInventory,
    isSubmittingInventory,
    onRefresh,
    onAddNeed,
    onAdjustNeed,
    onApprove,
    onReject,
    onOpenScheduler,
    onMessage
  }) => {
    const [createForm, setCreateForm] = useState({ sku: "", product: "", quantity: "" });
    const [drafts, setDrafts] = useState({});
    const openRows = sortInventoryRows(getOpenInventoryRows(inventoryRows));
    const awaitingCount = openRows.filter((row) => Number(row.awaitingApproval || 0) > 0).length;
    const latestInventoryUpdate = openRows.reduce((latest, row) => {
      const rawTimestamp = row?.lastUpdatedIso || row?.lastUpdated || row?.createdAtIso || row?.createdAt || "";
      if (!rawTimestamp) return latest;
      const parsedTime = new Date(rawTimestamp).getTime();
      if (!Number.isFinite(parsedTime)) {
        return latest || {
          time: Number.NEGATIVE_INFINITY,
          label: row?.lastUpdated || row?.createdAt || rawTimestamp
        };
      }
      if (!latest || parsedTime > latest.time) {
        return {
          time: parsedTime,
          label: row?.lastUpdated || row?.createdAt || rawTimestamp
        };
      }
      return latest;
    }, null);
    const roleLabel = formatRoleLabel(adminUser?.role, "Admin");
    const updateDraft = (rowNumber, field, value) => {
      setDrafts((prev) => ({
        ...prev,
        [rowNumber]: {
          ...prev[rowNumber] || {},
          [field]: value
        }
      }));
    };
    const clearDraft = (rowNumber, field) => {
      setDrafts((prev) => ({
        ...prev,
        [rowNumber]: {
          ...prev[rowNumber] || {},
          [field]: ""
        }
      }));
    };
    const submitRowAction = async (row, field, submitter, options = {}) => {
      const quantity = parseWholeNumber(drafts[row.rowNumber]?.[field], { allowNegative: Boolean(options.allowNegative) });
      if (quantity === null) {
        onMessage?.({ type: "error", message: options.invalidMessage || "Enter a whole number before saving this inventory change." });
        return;
      }
      const didSucceed = await submitter(row, quantity);
      if (didSucceed) {
        clearDraft(row.rowNumber, field);
      }
    };
    const submitCreate = async () => {
      const sku = String(createForm.sku || "").trim().toUpperCase();
      const product = String(createForm.product || "").trim();
      const quantity = parseWholeNumber(createForm.quantity);
      if (!sku || !product || !quantity) {
        onMessage?.({ type: "error", message: "Enter a SKU, Name, and whole-number Need Qty." });
        return;
      }
      const didSucceed = await onAddNeed(sku, product, quantity);
      if (didSucceed) {
        setCreateForm({ sku: "", product: "", quantity: "" });
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-full animate-fade-in overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-4 shrink-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, roleLabel), /* @__PURE__ */ React.createElement("h3", { className: "section-title mt-1" }, "Inventory Management"), latestInventoryUpdate && /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, "Latest card update: ", formatInventoryTimestamp(latestInventoryUpdate.label))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "status-chip bg-[#fef3c7]" }, awaitingCount, " awaiting"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onRefresh,
        disabled: isFetchingInventory || isSubmittingInventory,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isFetchingInventory ? "fa-circle-notch spinner" : "fa-rotate-right"} text-[#38bdf8]` }),
      /* @__PURE__ */ React.createElement("span", null, isFetchingInventory ? "Refreshing..." : "Refresh")
    ))), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[506px_278px] lg:justify-start gap-4 min-h-0 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "min-h-0 overflow-y-auto no-scrollbar pr-1 space-y-4" }, openRows.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "p-10 text-center text-gray-400 font-bold text-sm md:text-lg border-2 border-dashed border-gray-300 rounded-xl bg-white" }, "No active inventory rows are open.") : openRows.map((row) => /* @__PURE__ */ React.createElement("div", { key: row.rowNumber, className: "section-card panel-content-card surface-rounded" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-card-header" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-card-meta-block shrink-0 md:basis-[150px]" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-card-label" }, "SKU"), /* @__PURE__ */ React.createElement("div", { className: "inventory-card-sku mt-1" }, getInventorySkuText(row))), /* @__PURE__ */ React.createElement("div", { className: "inventory-card-meta-block min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-card-label" }, "Pen Name"), /* @__PURE__ */ React.createElement("h4", { className: "inventory-card-name mt-1" }, getInventoryNameText(row)))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-5 gap-2.5 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "surface-rounded border-2 border-black bg-[#f5f3ff] px-2.5 py-2.5 min-h-[88px] flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-label leading-tight" }, "Needed"), /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-value text-2xl leading-none" }, row.needed)), /* @__PURE__ */ React.createElement("div", { className: "surface-rounded border-2 border-black bg-[#ecfccb] px-2.5 py-2.5 min-h-[88px] flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-label leading-tight" }, "In Process"), /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-value text-2xl leading-none" }, row.inProcess)), /* @__PURE__ */ React.createElement("div", { className: "surface-rounded border-2 border-black bg-[#fef3c7] px-2.5 py-2.5 min-h-[88px] flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-label leading-tight" }, "Awaiting Approval"), /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-value text-2xl leading-none" }, row.awaitingApproval)), /* @__PURE__ */ React.createElement("div", { className: "surface-rounded border-2 border-black bg-[#d1fae5] px-2.5 py-2.5 min-h-[88px] flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-label leading-tight" }, "Approved"), /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-value text-2xl leading-none" }, row.addedToStore)), /* @__PURE__ */ React.createElement("div", { className: "surface-rounded border-2 border-black bg-[#fee2e2] px-2.5 py-2.5 min-h-[88px] flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-label leading-tight" }, "Still Needed"), /* @__PURE__ */ React.createElement("div", { className: "inventory-stat-value text-2xl leading-none" }, row.stillNeeded))), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-3 gap-2.5 mt-3 items-stretch" }, /* @__PURE__ */ React.createElement("div", { className: "surface-rounded border-2 border-black bg-[#eff6ff] p-2.5 flex flex-col min-h-[154px]" }, /* @__PURE__ */ React.createElement("div", { className: "card-title text-base" }, "Adjust Needed"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        step: "1",
        value: drafts[row.rowNumber]?.adjust || "",
        onChange: (e) => updateDraft(row.rowNumber, "adjust", e.target.value),
        className: "brutal-input w-full px-3 py-2 text-sm mt-2.5",
        placeholder: "0"
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => submitRowAction(row, "adjust", onAdjustNeed, { allowNegative: true, invalidMessage: "Enter a whole-number adjustment like 5 or -2." }),
        disabled: isSubmittingInventory,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-[#60a5fa] hover:bg-[#3b82f6] mt-auto self-start"
      },
      "Save"
    )), /* @__PURE__ */ React.createElement("div", { className: "surface-rounded border-2 border-black bg-[#f0fdf4] p-2.5 flex flex-col min-h-[154px]" }, /* @__PURE__ */ React.createElement("div", { className: "card-title text-base" }, "Approve"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: "1",
        step: "1",
        value: drafts[row.rowNumber]?.approve || "",
        onChange: (e) => updateDraft(row.rowNumber, "approve", e.target.value),
        className: "brutal-input w-full px-3 py-2 text-sm mt-2.5",
        placeholder: "0"
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => submitRowAction(row, "approve", onApprove),
        disabled: isSubmittingInventory || row.awaitingApproval <= 0,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-[#4ade80] hover:bg-[#22c55e] mt-auto self-start"
      },
      "Approve"
    )), /* @__PURE__ */ React.createElement("div", { className: "surface-rounded border-2 border-black bg-[#fff7ed] p-2.5 flex flex-col min-h-[154px]" }, /* @__PURE__ */ React.createElement("div", { className: "card-title text-base" }, "Send Back"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: "1",
        step: "1",
        value: drafts[row.rowNumber]?.reject || "",
        onChange: (e) => updateDraft(row.rowNumber, "reject", e.target.value),
        className: "brutal-input w-full px-3 py-2 text-sm mt-2.5",
        placeholder: "0"
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => submitRowAction(row, "reject", onReject),
        disabled: isSubmittingInventory || row.awaitingApproval <= 0,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-[#fb923c] hover:bg-[#f97316] mt-auto self-start"
      },
      "Send Back"
    )))))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "brutal-card bg-white p-4 md:p-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "card-title text-lg" }, "Start Inventory Request"), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, "Start a new SKU request or increase an open row.")), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-[112px_minmax(0,1fr)] gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "field-label block mb-2" }, "SKU"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: createForm.sku,
        onChange: (e) => setCreateForm((prev) => ({ ...prev, sku: e.target.value.toUpperCase() })),
        className: "brutal-input w-full px-3 py-2 text-sm",
        placeholder: "SKU"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "field-label block mb-2" }, "Name"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: createForm.product,
        onChange: (e) => setCreateForm((prev) => ({ ...prev, product: e.target.value })),
        className: "brutal-input w-full px-3 py-2 text-sm",
        placeholder: "Name"
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-[88px_minmax(0,1fr)] gap-3 items-end" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "field-label block mb-2" }, "Qty"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: "1",
        step: "1",
        value: createForm.quantity,
        onChange: (e) => setCreateForm((prev) => ({ ...prev, quantity: e.target.value })),
        className: "brutal-input w-full px-3 py-2 text-sm",
        placeholder: "0"
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: submitCreate,
        disabled: isSubmittingInventory,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-[#4ade80] hover:bg-[#22c55e] justify-self-start"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isSubmittingInventory ? "fa-circle-notch spinner" : "fa-plus"}` }),
      /* @__PURE__ */ React.createElement("span", null, isSubmittingInventory ? "Submitting..." : "Submit")
    )))))));
  };
  const AdminPayrollWorkspace = ({
    adminUser,
    employees,
    sheetData,
    isRefreshing,
    onRefresh
  }) => {
    if (!adminUser) return null;
    const safeEmployees = Array.isArray(employees) ? employees : [];
    const safeRows = Array.isArray(sheetData) ? sheetData : [];
    const currentPeriod = buildPayrollPeriodFromStart(getPayrollPeriodStart(/* @__PURE__ */ new Date()));
    const sortedStaffEmployees = sortEmployeesForDisplay(
      safeEmployees.filter((emp) => !isAdminRole(emp?.role) && isEmployeeActive(emp))
    );
    const employeeMapByName = new Map(
      safeEmployees.map((employee) => [String(employee?.name || "").trim().toLowerCase(), employee])
    );
    const adminNameSet = new Set(
      safeEmployees.filter((emp) => isAdminRole(emp?.role)).map((emp) => String(emp?.name || "").trim().toLowerCase()).filter(Boolean)
    );
    const payrollCandidateRows = safeRows.filter((row) => {
      const name = String(row?.name || "").trim();
      if (!name || adminNameSet.has(name.toLowerCase())) return false;
      if (isTimeOffRow(row) || !isPayrollRelevantRow(row)) return false;
      const rowDate = parseLocalDate(row?.date);
      return !isNaN(rowDate.getTime());
    });
    const staffEmployeeNames = sortedStaffEmployees.map((emp) => String(emp?.name || "").trim()).filter(Boolean);
    const knownEmployeeNameSet = new Set(staffEmployeeNames.map((name) => name.toLowerCase()));
    const rowOnlyEmployeeNames = [...new Set(
      payrollCandidateRows.map((row) => String(row?.name || "").trim()).filter(Boolean)
    )].filter((name) => !knownEmployeeNameSet.has(name.toLowerCase())).sort((a, b) => a.localeCompare(b));
    const employeeNames = [...staffEmployeeNames, ...rowOnlyEmployeeNames];
    const rowsByPeriodKey = payrollCandidateRows.reduce((acc, row) => {
      const periodKey = normalizeDate(getPayrollPeriodStart(row.date));
      if (!acc[periodKey]) acc[periodKey] = [];
      acc[periodKey].push(row);
      return acc;
    }, {});
    const payrollPeriods = [.../* @__PURE__ */ new Set([
      currentPeriod.key,
      ...Object.keys(rowsByPeriodKey)
    ])].sort((a, b) => b.localeCompare(a)).map((periodKey) => {
      const period = buildPayrollPeriodFromStart(periodKey);
      const periodRows = rowsByPeriodKey[period.key] || [];
      const employeeSummaries = employeeNames.map((name) => {
        const rows = periodRows.filter((row) => String(row?.name || "").trim() === name);
        const workedRows = rows.filter((row) => getPayrollRowMinutes(row) > 0);
        const employeeRecord = employeeMapByName.get(name.toLowerCase()) || null;
        const hourlyWage = getEmployeeHourlyWage(employeeRecord);
        const totalMinutes = workedRows.reduce((sum, row) => sum + getPayrollRowMinutes(row), 0);
        return {
          name,
          workedEntryCount: workedRows.length,
          editedEntryCount: workedRows.filter((row) => parseReasonCell(row.reason).length > 0).length,
          totalMinutes,
          totalPay: Number.isFinite(hourlyWage) ? totalMinutes / 60 * hourlyWage : null
        };
      });
      return {
        ...period,
        isActive: period.key === currentPeriod.key,
        totalMinutes: employeeSummaries.reduce((sum, summary) => sum + summary.totalMinutes, 0),
        employeeSummaries
      };
    });
    const roleLabel = formatRoleLabel(adminUser?.role, "Admin");
    const formatEntryCount = (count) => `${count} ${count === 1 ? "Entry" : "Entries"}`;
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-full min-h-0 animate-fade-in overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-4 shrink-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, roleLabel), /* @__PURE__ */ React.createElement("h3", { className: "section-title mt-1" }, "Payroll Period Hours")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2 shadow-safe-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onRefresh,
        disabled: isRefreshing,
        className: "brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isRefreshing ? "fa-circle-notch spinner" : "fa-rotate-right"} text-[#38bdf8]` }),
      /* @__PURE__ */ React.createElement("span", null, isRefreshing ? "Refreshing..." : "Refresh")
    ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto no-scrollbar shadow-safe-4 pr-1 pb-4" }, employeeNames.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400 bg-white" }, "No employee payroll rows were found.") : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-4 content-start" }, payrollPeriods.map((period) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: period.key,
        className: `section-card panel-content-card ${period.isActive ? "bg-[#dbeafe]" : "bg-[#f0fdf4]"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px] lg:items-center" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold font-poppins text-[#060606] text-base md:text-lg xl:text-xl leading-tight break-words" }, period.label), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1" }, period.isActive ? "Active period" : "Closed period")), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-white px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-bold tracking-[0.12em] text-gray-500" }, "Total Hours"), /* @__PURE__ */ React.createElement("div", { className: "text-xl font-bold font-poppins text-[#060606] mt-1" }, formatPayrollHours(period.totalMinutes))), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-black bg-white px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-bold tracking-[0.12em] text-gray-500" }, "Pay Date"), /* @__PURE__ */ React.createElement("div", { className: "text-sm md:text-base font-bold font-poppins text-[#060606] mt-1" }, formatFullDate(period.payDate)))),
      /* @__PURE__ */ React.createElement("div", { className: "mt-4 space-y-2" }, period.employeeSummaries.map((summary) => /* @__PURE__ */ React.createElement("div", { key: `${period.key}-${summary.name}`, className: "rounded-xl border-2 border-black bg-white px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "grid gap-2 md:grid-cols-[minmax(0,1fr)_120px_110px_170px_150px] md:items-center" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold font-poppins text-[#060606] text-sm md:text-base truncate" }, summary.name), /* @__PURE__ */ React.createElement("div", { className: "text-sm font-bold text-gray-600" }, formatEntryCount(summary.workedEntryCount)), /* @__PURE__ */ React.createElement("div", { className: "text-sm font-bold text-gray-600" }, summary.editedEntryCount, " Edited"), /* @__PURE__ */ React.createElement("div", { className: "text-sm md:text-base font-bold font-poppins text-[#060606] md:text-right" }, "Total Hours ", formatPayrollHours(summary.totalMinutes)), /* @__PURE__ */ React.createElement("div", { className: "text-sm md:text-base font-bold font-poppins text-[#060606] md:text-right" }, "Total Pay ", summary.totalPay === null ? "-" : formatCurrencyAmount(summary.totalPay))))))
    )))));
  };
  const AdminEmployeeWorkspace = ({
    adminUser,
    employees,
    isSubmitting,
    isCreating,
    onSave,
    onCreate
  }) => {
    if (!adminUser) return null;
    const safeEmployees = Array.isArray(employees) ? employees : [];
    const activeEmployees = sortEmployeesForDisplay(safeEmployees.filter((employee) => isEmployeeActive(employee)));
    const inactiveEmployees = sortEmployeesForDisplay(safeEmployees.filter((employee) => !isEmployeeActive(employee)));
    const [visibilityFilter, setVisibilityFilter] = useState("active");
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const editableEmployees = visibilityFilter === "all" ? [...activeEmployees, ...inactiveEmployees] : activeEmployees;
    const [selectedEmployeeRowNumber, setSelectedEmployeeRowNumber] = useState(
      editableEmployees[0]?.rowNumber ? String(editableEmployees[0].rowNumber) : ""
    );
    const selectedEmployee = isCreatingNew ? null : editableEmployees.find((employee) => String(employee?.rowNumber || "") === String(selectedEmployeeRowNumber || "")) || editableEmployees[0] || null;
    const baselineDraft = isCreatingNew ? buildEmptyEmployeeAdminDraft() : buildEmployeeAdminDraft(selectedEmployee);
    const [draft, setDraft] = useState(baselineDraft);
    useEffect(() => {
      if (isCreatingNew) {
        return;
      }
      if (!editableEmployees.length) {
        setSelectedEmployeeRowNumber("");
        return;
      }
      const hasSelection = editableEmployees.some((employee) => String(employee?.rowNumber || "") === String(selectedEmployeeRowNumber || ""));
      if (!hasSelection) {
        setSelectedEmployeeRowNumber(String(editableEmployees[0].rowNumber));
      }
    }, [employees, visibilityFilter, isCreatingNew]);
    useEffect(() => {
      setDraft(isCreatingNew ? buildEmptyEmployeeAdminDraft() : buildEmployeeAdminDraft(selectedEmployee));
    }, [
      isCreatingNew,
      selectedEmployee?.rowNumber,
      selectedEmployee?.name,
      selectedEmployee?.jobTitle,
      selectedEmployee?.department,
      selectedEmployee?.pin,
      selectedEmployee?.role,
      selectedEmployee?.active,
      selectedEmployee?.hourlyWage,
      selectedEmployee?.hourlyWageValue,
      selectedEmployee?.phoneNumber
    ]);
    const isDirty = isCreatingNew ? draft.name !== "" || draft.jobTitle !== "" || draft.pin !== "" || draft.role !== "employee" || Boolean(draft.active) !== true || draft.hourlyWage !== "" || draft.phoneNumber !== "" : Boolean(selectedEmployee) && (draft.name !== baselineDraft.name || draft.jobTitle !== baselineDraft.jobTitle || draft.pin !== baselineDraft.pin || draft.role !== baselineDraft.role || Boolean(draft.active) !== Boolean(baselineDraft.active) || draft.hourlyWage !== baselineDraft.hourlyWage || draft.phoneNumber !== baselineDraft.phoneNumber);
    const roleLabel = formatRoleLabel(adminUser?.role, "Admin");
    const hourlyWagePreview = formatCurrencyAmount(draft.hourlyWage);
    const updateDraft = (field, value) => {
      setDraft((prev) => ({
        ...prev,
        [field]: value
      }));
    };
    const handleSave = async () => {
      if (isSubmitting || isCreating) return;
      if (isCreatingNew) {
        if (!onCreate) return;
        const createdEmployee = await onCreate(draft);
        if (createdEmployee?.rowNumber) {
          setIsCreatingNew(false);
          setVisibilityFilter("all");
          setSelectedEmployeeRowNumber(String(createdEmployee.rowNumber));
        }
        return;
      }
      if (!selectedEmployee || !onSave) return;
      await onSave(selectedEmployee, draft);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-full min-h-0 animate-fade-in overflow-y-auto pr-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-4 shrink-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, roleLabel), /* @__PURE__ */ React.createElement("h3", { className: "section-title mt-1" }, "Employee Admin"), /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-xs md:text-sm font-bold text-gray-500" }, activeEmployees.length, " active, ", inactiveEmployees.length, " inactive")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setIsCreatingNew(true);
          setDraft(buildEmptyEmployeeAdminDraft());
        },
        disabled: isSubmitting || isCreating,
        className: "brutal-btn action-button action-button-fluid bg-white hover:bg-gray-50 text-[#060606] self-start"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-user-plus text-[#7c3aed]" }),
      /* @__PURE__ */ React.createElement("span", null, "Add Employee")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleSave,
        disabled: !selectedEmployee && !isCreatingNew || !isDirty || isSubmitting || isCreating,
        className: "brutal-btn action-button action-button-fluid bg-[#4ade80] hover:bg-[#22c55e] text-[#060606] self-start"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isSubmitting || isCreating ? "fa-circle-notch spinner" : "fa-save"}` }),
      /* @__PURE__ */ React.createElement("span", null, isSubmitting || isCreating ? isCreatingNew ? "Creating..." : "Saving..." : isCreatingNew ? "Create Employee" : "Save Employee")
    ))), editableEmployees.length === 0 && !isCreatingNew ? /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400 bg-white" }, "No employees were found in the Employees sheet.") : /* @__PURE__ */ React.createElement("div", { className: "grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)] flex-1 min-h-0" }, /* @__PURE__ */ React.createElement("div", { className: "section-card panel-content-card bg-white p-4 flex flex-col gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, "Choose Employee"), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-2" }, "Switch between active-only and all employees, or start a new employee record.")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setVisibilityFilter("active"),
        className: `brutal-btn action-button action-button-fluid ${visibilityFilter === "active" ? "bg-[#dbeafe] hover:bg-[#bfdbfe]" : "bg-white hover:bg-gray-50"} text-[#060606]`
      },
      /* @__PURE__ */ React.createElement("span", null, "Active Only")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setVisibilityFilter("all"),
        className: `brutal-btn action-button action-button-fluid ${visibilityFilter === "all" ? "bg-[#f3e8ff] hover:bg-[#e9d5ff]" : "bg-white hover:bg-gray-50"} text-[#060606]`
      },
      /* @__PURE__ */ React.createElement("span", null, "Show All")
    )), /* @__PURE__ */ React.createElement("div", { className: "admin-studio-control-shell admin-studio-select-shell" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-user-gear text-[#38bdf8]" }), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: isCreatingNew ? "__new__" : selectedEmployee ? String(selectedEmployee.rowNumber) : "",
        onChange: (e) => {
          const nextValue = e.target.value;
          if (nextValue === "__new__") {
            setIsCreatingNew(true);
            setDraft(buildEmptyEmployeeAdminDraft());
            return;
          }
          setIsCreatingNew(false);
          setSelectedEmployeeRowNumber(nextValue);
        },
        className: "admin-studio-select"
      },
      /* @__PURE__ */ React.createElement("option", { value: "__new__" }, "Add New Employee"),
      editableEmployees.map((employee) => /* @__PURE__ */ React.createElement("option", { key: `employee-admin-${employee.rowNumber}`, value: String(employee.rowNumber) }, employee.name, " ", isEmployeeActive(employee) ? "" : "(Inactive)"))
    ), /* @__PURE__ */ React.createElement("i", { className: "fas fa-chevron-down text-xs text-gray-500" })), (selectedEmployee || isCreatingNew) && /* @__PURE__ */ React.createElement("div", { className: `section-card px-4 py-3 ${draft.active ? "bg-[#eff6ff]" : "bg-[#fef2f2]"}` }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-gray-500" }, isCreatingNew ? "New Employee" : draft.active ? "Active Account" : "Inactive Account"), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-2 break-words" }, draft.name || selectedEmployee?.name || "New employee"), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-2" }, draft.jobTitle || "No job title set"), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-2" }, formatRoleLabel(draft.role, "Employee")), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-2" }, hourlyWagePreview || "No hourly wage set"))), /* @__PURE__ */ React.createElement("div", { className: "section-card panel-content-card bg-white p-4 md:p-5" }, /* @__PURE__ */ React.createElement("div", { className: "grid gap-4 md:grid-cols-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-2" }, "Name"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: draft.name,
        onChange: (e) => updateDraft("name", e.target.value),
        className: "brutal-input w-full px-3 py-2.5",
        placeholder: "Employee name"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-2" }, "Job Title"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: draft.jobTitle,
        onChange: (e) => updateDraft("jobTitle", e.target.value),
        className: "brutal-input w-full px-3 py-2.5",
        placeholder: "Job title"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-2" }, "PIN"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        value: draft.pin,
        onChange: (e) => updateDraft("pin", e.target.value.replace(/[^\d]/g, "")),
        className: "brutal-input w-full px-3 py-2.5",
        placeholder: "4 digit PIN"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-2" }, "Role"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: draft.role,
        onChange: (e) => updateDraft("role", e.target.value),
        className: "brutal-input w-full px-3 py-2.5"
      },
      /* @__PURE__ */ React.createElement("option", { value: "employee" }, "Employee"),
      /* @__PURE__ */ React.createElement("option", { value: "admin" }, "Admin"),
      /* @__PURE__ */ React.createElement("option", { value: "manager" }, "Manager"),
      /* @__PURE__ */ React.createElement("option", { value: "owner" }, "Owner")
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-2" }, "Active"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: draft.active ? "true" : "false",
        onChange: (e) => updateDraft("active", e.target.value === "true"),
        className: "brutal-input w-full px-3 py-2.5"
      },
      /* @__PURE__ */ React.createElement("option", { value: "true" }, "Active"),
      /* @__PURE__ */ React.createElement("option", { value: "false" }, "Inactive")
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-2" }, "Hourly Wage"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: "0",
        step: "0.01",
        value: draft.hourlyWage,
        onChange: (e) => updateDraft("hourlyWage", e.target.value),
        className: "brutal-input w-full px-3 py-2.5",
        placeholder: "0.00"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-2" }, hourlyWagePreview || "Enter an hourly rate in dollars")), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-2" }, "Phone Number"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: draft.phoneNumber,
        onChange: (e) => updateDraft("phoneNumber", e.target.value),
        className: "brutal-input w-full px-3 py-2.5",
        placeholder: "Phone number"
      }
    ))))));
  };
  const AdminScheduleWorkspace = ({
    adminUser,
    employees,
    sheetData,
    weekStart,
    onPrevWeek,
    onNextWeek,
    onLoadSavedWeek,
    selectedCell,
    onSelectCell,
    onCloseEditor,
    getCellDraft,
    updateCellDraft,
    applyTemplateToCell,
    shiftTemplates,
    templateName,
    onTemplateNameChange,
    onSaveCurrentTemplate,
    savedWeekOptions,
    saveWeekSchedules,
    clearWeekSchedules,
    dirtyCount,
    isRefreshing,
    isSubmitting,
    isSubmittingTimeOff,
    isSavingTemplates,
    onApproveTimeOff,
    onClearTimeOff
  }) => {
    const [weekJumpValue, setWeekJumpValue] = useState("");
    const [editorDraft, setEditorDraft] = useState(null);
    const sortedEmployees = sortEmployeesForDisplay(
      (Array.isArray(employees) ? employees : []).filter((employee) => isEmployeeActive(employee))
    );
    const weekDays = buildWeekDays(weekStart);
    const currentWeekKey = normalizeDate(weekStart);
    const loadableWeekOptions = (Array.isArray(savedWeekOptions) ? savedWeekOptions : []).filter((option) => option?.weekKey && option.weekKey !== currentWeekKey);
    const visibleTemplates = getVisibleAdminShiftTemplates(shiftTemplates);
    const quickActionCount = visibleTemplates.length + 1;
    const formatShortDate = (dateValue) => {
      return parseLocalDate(dateValue).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
    const selectedDraft = selectedCell ? getCellDraft(selectedCell.name, selectedCell.date) : null;
    const isSelectingDayEmployee = Boolean(selectedDraft && !String(selectedDraft.name || "").trim());
    const selectedTimeOffRow = selectedCell && String(selectedCell.name || "").trim() ? getTimeOffRowForEmployeeDate(sheetData, selectedCell.name, selectedCell.date) : null;
    const selectedTimeOffMeta = parseTimeOffMetadata(selectedTimeOffRow?.reason);
    const isReviewingTimeOff = Boolean(selectedTimeOffRow && !isSelectingDayEmployee);
    useEffect(() => {
      const selectedName = String(selectedCell?.name || "").trim();
      if (!selectedCell || !selectedName) {
        setEditorDraft(null);
        if (onTemplateNameChange) onTemplateNameChange("");
        return;
      }
      const nextDraft = getCellDraft(selectedName, selectedCell.date);
      setEditorDraft({
        ...nextDraft,
        name: selectedName,
        date: normalizeDate(selectedCell.date),
        scheduleStatus: normalizeAdminScheduleStatus(nextDraft.scheduleStatus),
        clearSchedule: Boolean(nextDraft.clearSchedule)
      });
      if (onTemplateNameChange) onTemplateNameChange("");
    }, [selectedCell ? selectedCell.name : "", selectedCell ? selectedCell.date : ""]);
    const activeSelectedDraft = isSelectingDayEmployee ? selectedDraft : editorDraft || selectedDraft;
    const getScheduledShiftPreview = (draft) => {
      if (!draft || draft.clearSchedule) {
        return {
          formattedIn: "",
          formattedOut: "",
          minutes: null,
          hasAssignedShift: false
        };
      }
      const formattedIn = formatTimeField(draft.schedIn, draft.schedInPeriod);
      const formattedOut = formatTimeField(draft.schedOut, draft.schedOutPeriod);
      return {
        formattedIn,
        formattedOut,
        minutes: calculateWorkedMinutes(formattedIn, formattedOut),
        hasAssignedShift: Boolean(formattedIn && formattedOut)
      };
    };
    const selectedShiftPreview = getScheduledShiftPreview(activeSelectedDraft);
    const selectedFormattedIn = selectedShiftPreview.formattedIn;
    const selectedFormattedOut = selectedShiftPreview.formattedOut;
    const selectedPreviewMinutes = selectedShiftPreview.minutes;
    const canSaveEditorDraft = Boolean(
      activeSelectedDraft && !isReviewingTimeOff && !isSelectingDayEmployee && (activeSelectedDraft.clearSchedule || selectedFormattedIn && selectedFormattedOut)
    );
    const canSaveTemplate = Boolean(
      activeSelectedDraft && !isReviewingTimeOff && !isSelectingDayEmployee && !activeSelectedDraft.clearSchedule && selectedFormattedIn && selectedFormattedOut && String(templateName || "").trim()
    );
    const updateEditorDraft = (patch) => {
      setEditorDraft((prev) => {
        if (!prev) return prev;
        const nextPatch = typeof patch === "function" ? patch(prev) : patch;
        return {
          ...prev,
          ...nextPatch,
          name: prev.name,
          date: prev.date,
          sourceRow: nextPatch?.sourceRow === void 0 ? prev.sourceRow || null : nextPatch.sourceRow
        };
      });
    };
    const clearEditorForm = () => {
      updateEditorDraft({
        schedIn: "",
        schedInPeriod: "AM",
        schedOut: "",
        schedOutPeriod: "PM",
        scheduleStatus: DEFAULT_ADMIN_SCHEDULE_STATUS,
        clearSchedule: false
      });
    };
    const applyTemplateToEditorDraft = (template) => {
      if (!template || isSelectingDayEmployee || isReviewingTimeOff) return;
      updateEditorDraft((currentDraft) => {
        if (template.clearSchedule) {
          return {
            schedIn: "",
            schedInPeriod: "AM",
            schedOut: "",
            schedOutPeriod: "PM",
            scheduleStatus: "",
            clearSchedule: true
          };
        }
        const parsedIn = parseTimeField(template.schedIn);
        const parsedOut = parseTimeField(template.schedOut);
        return {
          schedIn: parsedIn.time,
          schedInPeriod: parsedIn.period || "AM",
          schedOut: parsedOut.time,
          schedOutPeriod: parsedOut.period || "PM",
          scheduleStatus: normalizeAdminScheduleStatus(template.scheduleStatus),
          clearSchedule: false
        };
      });
    };
    const handleSaveShift = () => {
      if (!canSaveEditorDraft || !activeSelectedDraft || isSelectingDayEmployee || isReviewingTimeOff) return;
      updateCellDraft(activeSelectedDraft.name, activeSelectedDraft.date, {
        schedIn: activeSelectedDraft.clearSchedule ? "" : activeSelectedDraft.schedIn,
        schedInPeriod: activeSelectedDraft.clearSchedule ? "AM" : activeSelectedDraft.schedInPeriod,
        schedOut: activeSelectedDraft.clearSchedule ? "" : activeSelectedDraft.schedOut,
        schedOutPeriod: activeSelectedDraft.clearSchedule ? "PM" : activeSelectedDraft.schedOutPeriod,
        scheduleStatus: activeSelectedDraft.clearSchedule ? "" : normalizeAdminScheduleStatus(activeSelectedDraft.scheduleStatus),
        clearSchedule: Boolean(activeSelectedDraft.clearSchedule)
      });
      onCloseEditor();
    };
    const handleSaveTemplate = async () => {
      if (!canSaveTemplate || !activeSelectedDraft || !onSaveCurrentTemplate) return;
      await onSaveCurrentTemplate(activeSelectedDraft, templateName);
    };
    const getWeekGridCellState = (employeeName, dayKey) => {
      const draft = getCellDraft(employeeName, dayKey);
      const timeOffRow = getTimeOffRowForEmployeeDate(sheetData, employeeName, dayKey);
      const timeOffMeta = parseTimeOffMetadata(timeOffRow?.reason);
      const shiftPreview = getScheduledShiftPreview(draft);
      const cellFormattedIn = shiftPreview.formattedIn;
      const cellFormattedOut = shiftPreview.formattedOut;
      const cellMinutes = shiftPreview.minutes;
      const hasAssignedShift = shiftPreview.hasAssignedShift;
      const isSelected = selectedCell && selectedCell.name === employeeName && selectedCell.date === dayKey;
      const isDirty = !areAdminScheduleDraftsEquivalent(draft, draft.sourceRow ? buildAdminScheduleDraftFromRow(draft.sourceRow, employeeName, dayKey) : buildEmptyAdminScheduleForm(employeeName, dayKey));
      const cellStateClass = isSelected ? "bg-[#38bdf8] text-[#060606]" : isDirty ? "bg-[#fef3c7] text-[#060606]" : hasAssignedShift ? "bg-white text-[#060606]" : "bg-[#f8fafc] text-[#060606]";
      return {
        draft,
        timeOffRow,
        timeOffMeta,
        cellFormattedIn,
        cellFormattedOut,
        cellMinutes,
        hasAssignedShift,
        isSelected,
        cellStateClass
      };
    };
    const employeeWeekSummaries = sortedEmployees.map((employee) => {
      const totalMinutes = weekDays.reduce((sum, dayObj) => {
        const dayKey = normalizeDate(dayObj);
        const shiftPreview = getScheduledShiftPreview(getCellDraft(employee.name, dayKey));
        return sum + (shiftPreview.hasAssignedShift ? shiftPreview.minutes || 0 : 0);
      }, 0);
      const shiftCount = weekDays.reduce((count, dayObj) => {
        const dayKey = normalizeDate(dayObj);
        return count + (getScheduledShiftPreview(getCellDraft(employee.name, dayKey)).hasAssignedShift ? 1 : 0);
      }, 0);
      return {
        id: employee.id || employee.name,
        name: employee.name,
        department: employee.department || "Team",
        totalMinutes,
        shiftCount
      };
    });
    const totalScheduledWeekMinutes = employeeWeekSummaries.reduce((sum, employeeSummary) => sum + employeeSummary.totalMinutes, 0);
    const renderWeekBoardDay = (dayObj) => {
      const dayKey = normalizeDate(dayObj);
      const isToday = dayKey === normalizeDate(/* @__PURE__ */ new Date());
      const weekdayLabel = dayObj.toLocaleDateString("en-US", { weekday: "long" });
      const dayEntries = sortedEmployees.map((emp) => ({
        employee: emp,
        ...getWeekGridCellState(emp.name, dayKey)
      })).filter((entry) => entry.timeOffRow || entry.hasAssignedShift || entry.draft.clearSchedule || entry.isSelected);
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: dayKey,
          className: [
            "section-card admin-week-board-day-card overflow-hidden bg-white",
            isToday ? "ring-4 ring-[#bae6fd]" : ""
          ].filter(Boolean).join(" ")
        },
        /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => onSelectCell("", dayKey),
            className: `w-full admin-week-board-day-button border-b-2 border-black text-left ${isToday ? "bg-[#38bdf8] text-[#060606]" : "bg-[#bae6fd] text-[#060606]"}`
          },
          /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#060606]" }, weekdayLabel),
          /* @__PURE__ */ React.createElement("div", { className: "card-title mt-1" }, formatShortDate(dayObj))
        ),
        /* @__PURE__ */ React.createElement("div", { className: `admin-week-board-scroll no-scrollbar ${dayEntries.length > 0 ? "space-y-2" : ""}` }, dayEntries.map(({ employee, draft, timeOffRow, timeOffMeta, cellFormattedIn, cellFormattedOut, cellMinutes, hasAssignedShift, cellStateClass, isSelected }, index) => {
          const isTimeOffApproved = isApprovedTimeOffRow(timeOffRow);
          const surfaceClass = timeOffRow ? isTimeOffApproved ? "bg-[#fee2e2]" : "bg-[#fff7ed]" : draft.clearSchedule ? "bg-[#fee2e2]" : isSelected ? "bg-[#dbeafe]" : cellStateClass;
          const outlineClass = isSelected ? "ring-2 ring-[#38bdf8]" : "";
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              key: `${dayKey}-${employee.id}-${index}`,
              type: "button",
              onClick: () => onSelectCell(employee.name, dayKey),
              className: `schedule-shift-card admin-week-board-shift-card w-full text-left transition-colors ${surfaceClass} ${outlineClass}`
            },
            /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "card-title truncate" }, employee.name), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1 truncate" }, employee.department || "Team")), (timeOffRow || draft.clearSchedule || isSelected) && /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-gray-500" }, timeOffRow ? isTimeOffApproved ? "Blocked" : "Request" : draft.clearSchedule ? "Clearing" : "Editing")),
            timeOffRow ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "card-meta text-[#060606] mt-2.5" }, getTimeOffRangeLabel(timeOffRow, timeOffMeta)), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1" }, isTimeOffApproved ? "Approved block on the schedule" : "Awaiting admin approval"), hasAssignedShift && /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1 text-gray-500" }, "Current shift: ", cellFormattedIn, " - ", cellFormattedOut)) : draft.clearSchedule ? /* @__PURE__ */ React.createElement("div", { className: "card-meta text-[#060606] mt-2.5" }, "Schedule will be removed") : hasAssignedShift ? /* @__PURE__ */ React.createElement("div", { className: "admin-week-board-shift-time mt-2.5" }, cellFormattedIn, " - ", cellFormattedOut) : null,
            !timeOffRow && (draft.clearSchedule || hasAssignedShift) && /* @__PURE__ */ React.createElement("div", { className: "card-meta admin-week-board-shift-duration mt-1" }, draft.clearSchedule ? "Removal staged" : formatWorkedDurationForDisplay(cellMinutes))
          );
        }))
      );
    };
    if (!adminUser) return null;
    const roleLabel = formatRoleLabel(adminUser?.role, "Admin");
    return /* @__PURE__ */ React.createElement("div", { className: "section-width flex flex-col h-full min-h-0 animate-fade-in overflow-y-auto pr-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-4 md:mb-6 shrink-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, roleLabel), /* @__PURE__ */ React.createElement("h3", { className: "page-title sm:whitespace-nowrap" }, "Schedule Builder"), /* @__PURE__ */ React.createElement("div", { className: "mt-3 space-y-1" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs md:text-sm font-bold text-gray-500" }, selectedDraft ? isSelectingDayEmployee ? `Choose employee - ${formatMonthDayDate(selectedDraft.date)}` : selectedTimeOffRow ? `${selectedDraft.name} - ${getTimeOffStatusLabel(selectedTimeOffRow)}` : `${selectedDraft.name} - ${formatMonthDayDate(selectedDraft.date)}` : "Click a date to add shifts"), /* @__PURE__ */ React.createElement("div", { className: "text-xs md:text-sm font-bold text-gray-500" }, isRefreshing ? "Syncing latest schedule rows..." : `${sortedEmployees.length} active team member${sortedEmployees.length === 1 ? "" : "s"} in view`))), /* @__PURE__ */ React.createElement("div", { className: "admin-studio-toolbar" }, /* @__PURE__ */ React.createElement("div", { className: "admin-studio-toolbar-wide" }, /* @__PURE__ */ React.createElement("div", { className: "admin-studio-control-shell admin-studio-nav-shell" }, /* @__PURE__ */ React.createElement("button", { onClick: onPrevWeek, className: "admin-studio-nav-button font-bold font-poppins text-lg" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-chevron-left" })), /* @__PURE__ */ React.createElement("span", { className: "admin-studio-range-label" }, formatWeekRangeLabel(weekStart)), /* @__PURE__ */ React.createElement("button", { onClick: onNextWeek, className: "admin-studio-nav-button font-bold font-poppins text-lg" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-chevron-right" })))), /* @__PURE__ */ React.createElement("div", { className: "admin-studio-toolbar-wide" }, /* @__PURE__ */ React.createElement("div", { className: "admin-studio-control-shell admin-studio-select-shell" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-folder-open text-[#38bdf8]" }), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: weekJumpValue,
        onChange: (e) => {
          const nextWeek = e.target.value;
          setWeekJumpValue(nextWeek);
          if (nextWeek) {
            onLoadSavedWeek?.(nextWeek);
            setWeekJumpValue("");
          }
        },
        className: "admin-studio-select",
        disabled: loadableWeekOptions.length === 0
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, loadableWeekOptions.length === 0 ? "No saved weeks yet" : "Copy saved week"),
      loadableWeekOptions.map((option) => /* @__PURE__ */ React.createElement("option", { key: option.weekKey, value: option.weekKey }, option.label, " (", option.shiftCount, " shift", option.shiftCount === 1 ? "" : "s", ")"))
    ), /* @__PURE__ */ React.createElement("i", { className: "fas fa-chevron-down text-xs text-gray-500" }))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: saveWeekSchedules,
        disabled: isSubmitting || dirtyCount === 0,
        className: "brutal-btn admin-studio-action admin-studio-save-button bg-[#4ade80] hover:bg-[#22c55e] text-[#060606]"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isSubmitting ? "fa-circle-notch spinner" : "fa-save"}` }),
      /* @__PURE__ */ React.createElement("span", null, isSubmitting ? "Saving All..." : `Save All${dirtyCount === 0 ? "" : ` (${dirtyCount})`}`)
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: clearWeekSchedules,
        disabled: isSubmitting || dirtyCount === 0,
        className: "brutal-btn admin-studio-action bg-white hover:bg-gray-50 text-[#060606]"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-eraser text-[#f43f5e]" }),
      /* @__PURE__ */ React.createElement("span", null, `Clear All${dirtyCount === 0 ? "" : ` (${dirtyCount})`}`)
    ))), /* @__PURE__ */ React.createElement("div", { className: "section-card panel-content-card overflow-hidden flex flex-col flex-1 min-h-[520px] lg:min-h-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-auto pr-1 pb-1" }, sortedEmployees.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "h-full flex items-center justify-center text-center text-sm md:text-base font-bold text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl bg-[#f8fafc]" }, "No active employees were found for scheduling.") : /* @__PURE__ */ React.createElement("div", { className: "schedule-week-grid admin-week-board-grid" }, weekDays.map((dayObj) => renderWeekBoardDay(dayObj)))), /* @__PURE__ */ React.createElement("div", { className: "border-t-2 border-black bg-[#f8fafc] px-3 py-3 md:px-4 md:py-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "section-card bg-white px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, "Week Total"), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-2" }, formatPayrollHours(totalScheduledWeekMinutes), " hrs"))), /* @__PURE__ */ React.createElement("div", { className: "section-card bg-white p-4 mt-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, "Hours by Person")), /* @__PURE__ */ React.createElement("div", { className: "card-meta" }, employeeWeekSummaries.length, " team member", employeeWeekSummaries.length === 1 ? "" : "s")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 mt-4" }, employeeWeekSummaries.map((employeeSummary) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: `week-summary-${employeeSummary.id}`,
        className: `section-card px-3 py-3 ${employeeSummary.totalMinutes > 0 ? "bg-[#eff6ff]" : "bg-[#f8fafc]"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "card-title truncate text-sm" }, employeeSummary.name), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1 truncate" }, employeeSummary.department)), /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-gray-500" }, employeeSummary.shiftCount, " shift", employeeSummary.shiftCount === 1 ? "" : "s")),
      /* @__PURE__ */ React.createElement("div", { className: "card-title mt-3" }, formatPayrollHours(employeeSummary.totalMinutes), " hrs")
    )))))), selectedDraft && /* @__PURE__ */ React.createElement("div", { className: "editor-modal-backdrop", onClick: onCloseEditor }, /* @__PURE__ */ React.createElement("div", { className: "brutal-card editor-modal bg-white p-4 md:p-6", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-start md:justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#38bdf8]" }, isSelectingDayEmployee ? "Choose Employee" : isReviewingTimeOff ? "Time-Off Review" : "Schedule Editor"), /* @__PURE__ */ React.createElement("h4", { className: "section-title mt-1" }, isSelectingDayEmployee ? formatFullDate(selectedDraft.date) : selectedDraft.name), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, isSelectingDayEmployee ? "Choose who you want to schedule for this day." : formatFullDate(selectedDraft.date))), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onCloseEditor,
        className: "brutal-btn bg-white px-4 py-2 text-sm md:text-base flex items-center gap-2 self-start"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-xmark" }),
      /* @__PURE__ */ React.createElement("span", null, "Cancel")
    )), isSelectingDayEmployee ? /* @__PURE__ */ React.createElement("div", { className: "section-card bg-[#f8fafc] p-4 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "card-title" }, "Choose Employee"), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, "Select a team member to create or edit a shift for this day.")), /* @__PURE__ */ React.createElement("div", { className: "card-meta" }, sortedEmployees.length, " available employee", sortedEmployees.length === 1 ? "" : "s")), /* @__PURE__ */ React.createElement("div", { className: "card-grid mt-4" }, sortedEmployees.map((employee) => {
      const employeeState = getWeekGridCellState(employee.name, selectedDraft.date);
      const alreadyScheduled = employeeState.timeOffRow || employeeState.hasAssignedShift || employeeState.draft.clearSchedule;
      const selectionCardClass = employeeState.timeOffRow ? isApprovedTimeOffRow(employeeState.timeOffRow) ? "bg-[#fee2e2]" : "bg-[#fff7ed]" : alreadyScheduled ? "bg-[#dbeafe]" : "bg-white hover:bg-[#f8fafc]";
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: `${selectedDraft.date}-${employee.id}`,
          type: "button",
          onClick: () => onSelectCell(employee.name, selectedDraft.date),
          className: `brutal-btn card-frame card-size-1x1 p-3 text-left flex flex-col justify-between ${selectionCardClass}`
        },
        /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-title text-sm" }, employee.name), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1" }, employee.department || "Team")),
        /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-3 text-[#060606]" }, employeeState.timeOffRow ? `${getTimeOffStatusLabel(employeeState.timeOffRow)} - ${getTimeOffRangeLabel(employeeState.timeOffRow, employeeState.timeOffMeta)}` : employeeState.hasAssignedShift ? `${employeeState.cellFormattedIn} - ${employeeState.cellFormattedOut}` : employeeState.draft.clearSchedule ? "Clearing on save" : "Add shift")
      );
    }))) : isReviewingTimeOff ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "section-card bg-[#f8fafc] px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Requested Block"), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-2" }, getTimeOffRangeLabel(selectedTimeOffRow, selectedTimeOffMeta))), /* @__PURE__ */ React.createElement("div", { className: "section-card bg-[#f8fafc] px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Status"), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-2" }, isApprovedTimeOffRow(selectedTimeOffRow) ? "Approved block" : "Awaiting approval"), selectedTimeOffMeta?.approvedBy ? /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1" }, "Approved by ", selectedTimeOffMeta.approvedBy) : selectedTimeOffMeta?.requestedAt ? /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-1" }, "Requested ", formatHistoryTimestamp(selectedTimeOffMeta.requestedAt)) : null)), selectedFormattedIn && selectedFormattedOut && /* @__PURE__ */ React.createElement("div", { className: "section-card bg-[#eff6ff] p-4 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Existing Scheduled Shift"), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, "This shift is still on the board until you approve the request or remove the block."), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-3" }, selectedFormattedIn, " - ", selectedFormattedOut)), /* @__PURE__ */ React.createElement("div", { className: "section-card bg-white p-4 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "card-title" }, isApprovedTimeOffRow(selectedTimeOffRow) ? "Approved Time Off" : "Time-Off Request"), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, isApprovedTimeOffRow(selectedTimeOffRow) ? "This employee is currently blocked on the schedule for this day." : "Approve this request to block the day for the employee.")), /* @__PURE__ */ React.createElement("div", { className: `status-chip ${isApprovedTimeOffRow(selectedTimeOffRow) ? "bg-[#fecaca]" : "bg-[#fde68a]"}` }, getTimeOffStatusLabel(selectedTimeOffRow))), /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex flex-col md:flex-row gap-3 md:justify-end" }, !isApprovedTimeOffRow(selectedTimeOffRow) && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onApproveTimeOff && onApproveTimeOff(selectedTimeOffRow),
        disabled: isSubmittingTimeOff,
        className: "brutal-btn bg-[#4ade80] hover:bg-[#22c55e] px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isSubmittingTimeOff ? "fa-circle-notch spinner" : "fa-check"}` }),
      /* @__PURE__ */ React.createElement("span", null, isSubmittingTimeOff ? "Saving..." : "Approve Request")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onClearTimeOff && onClearTimeOff(selectedTimeOffRow),
        disabled: isSubmittingTimeOff,
        className: "brutal-btn bg-white px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-trash-can text-[#f43f5e]" }),
      /* @__PURE__ */ React.createElement("span", null, isApprovedTimeOffRow(selectedTimeOffRow) ? "Remove Block" : "Clear Request")
    )))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "section-card bg-[#f8fafc] px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Shift"), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-2" }, activeSelectedDraft.clearSchedule ? "Clearing on save" : selectedFormattedIn && selectedFormattedOut ? `${selectedFormattedIn} - ${selectedFormattedOut}` : "No shift assigned")), /* @__PURE__ */ React.createElement("div", { className: "section-card bg-[#f8fafc] px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Duration"), /* @__PURE__ */ React.createElement("div", { className: "card-title mt-2" }, activeSelectedDraft.clearSchedule ? "Removed" : selectedPreviewMinutes === null ? "--" : formatWorkedDurationForDisplay(selectedPreviewMinutes)))), /* @__PURE__ */ React.createElement("div", { className: "section-card bg-white p-4 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "card-title" }, "Shift Details"), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, "Enter the scheduled in time, scheduled out time, and status for this shift.")), activeSelectedDraft.clearSchedule && /* @__PURE__ */ React.createElement("div", { className: "status-chip bg-[#fee2e2]" }, "Shift removal staged")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-end mt-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "field-label block mb-2" }, "Scheduled In"), /* @__PURE__ */ React.createElement("div", { className: "w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-center gap-3 px-3 focus-within:shadow-[4px_4px_0px_0px_#000000] transition-shadow" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        placeholder: "9:00",
        value: activeSelectedDraft.clearSchedule ? "" : activeSelectedDraft.schedIn,
        onChange: (e) => {
          const next = normalizeTimeInputWithPeriod(e.target.value, activeSelectedDraft.schedInPeriod);
          updateEditorDraft({
            schedIn: next.time,
            schedInPeriod: next.period,
            clearSchedule: false
          });
        },
        className: "w-[5ch] min-w-[5ch] py-3 font-bold text-sm md:text-base bg-transparent outline-none",
        maxLength: 5
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "ml-auto flex shrink-0 items-center gap-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => updateEditorDraft({ schedInPeriod: "AM", clearSchedule: false }), className: `text-xs md:text-sm font-bold ${activeSelectedDraft.schedInPeriod === "AM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}` }, "AM"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => updateEditorDraft({ schedInPeriod: "PM", clearSchedule: false }), className: `text-xs md:text-sm font-bold ${activeSelectedDraft.schedInPeriod === "PM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}` }, "PM")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "field-label block mb-2" }, "Scheduled Out"), /* @__PURE__ */ React.createElement("div", { className: "w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-center gap-3 px-3 focus-within:shadow-[4px_4px_0px_0px_#000000] transition-shadow" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        placeholder: "5:00",
        value: activeSelectedDraft.clearSchedule ? "" : activeSelectedDraft.schedOut,
        onChange: (e) => {
          const next = normalizeTimeInputWithPeriod(e.target.value, activeSelectedDraft.schedOutPeriod);
          updateEditorDraft({
            schedOut: next.time,
            schedOutPeriod: next.period,
            clearSchedule: false
          });
        },
        className: "w-[5ch] min-w-[5ch] py-3 font-bold text-sm md:text-base bg-transparent outline-none",
        maxLength: 5
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "ml-auto flex shrink-0 items-center gap-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => updateEditorDraft({ schedOutPeriod: "AM", clearSchedule: false }), className: `text-xs md:text-sm font-bold ${activeSelectedDraft.schedOutPeriod === "AM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}` }, "AM"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => updateEditorDraft({ schedOutPeriod: "PM", clearSchedule: false }), className: `text-xs md:text-sm font-bold ${activeSelectedDraft.schedOutPeriod === "PM" ? "text-[#060606]" : "text-gray-400 hover:text-gray-500"}` }, "PM")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "field-label block mb-2" }, "Status"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: activeSelectedDraft.clearSchedule ? DEFAULT_ADMIN_SCHEDULE_STATUS : normalizeAdminScheduleStatus(activeSelectedDraft.scheduleStatus),
        onChange: (e) => updateEditorDraft({ scheduleStatus: e.target.value, clearSchedule: false }),
        className: "w-full brutal-input px-3 py-3 font-bold text-sm md:text-base"
      },
      /* @__PURE__ */ React.createElement("option", { value: "Draft" }, "Draft"),
      /* @__PURE__ */ React.createElement("option", { value: "Published" }, "Published")
    ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto] gap-3 items-end mt-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "field-label block mb-2" }, "Template Name"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: templateName,
        onChange: (e) => onTemplateNameChange && onTemplateNameChange(e.target.value),
        placeholder: "Morning Shift",
        className: "w-full brutal-input px-3 py-3 font-bold text-sm md:text-base"
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: clearEditorForm,
        className: "brutal-btn bg-white px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-eraser text-[#f59e0b]" }),
      /* @__PURE__ */ React.createElement("span", null, "Clear Form")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: handleSaveTemplate,
        disabled: !canSaveTemplate || isSavingTemplates,
        className: "brutal-btn bg-[#dbeafe] hover:bg-[#bfdbfe] px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
      },
      /* @__PURE__ */ React.createElement("i", { className: `fas ${isSavingTemplates ? "fa-circle-notch spinner" : "fa-bookmark"}` }),
      /* @__PURE__ */ React.createElement("span", null, isSavingTemplates ? "Saving Template..." : "Save as Template")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: handleSaveShift,
        disabled: !canSaveEditorDraft,
        className: "brutal-btn bg-[#4ade80] hover:bg-[#22c55e] px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-save" }),
      /* @__PURE__ */ React.createElement("span", null, "Save Shift")
    )), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-3" }, "Save Shift stages this card on the week board. Use Save All at the top when you are ready to publish the whole week.")), /* @__PURE__ */ React.createElement("div", { className: "section-card bg-[#eff6ff] p-4 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "card-title" }, "Quick Templates"), /* @__PURE__ */ React.createElement("p", { className: "section-subtitle mt-1" }, "Apply a saved shift or stage a removal in one click.")), /* @__PURE__ */ React.createElement("div", { className: "card-meta" }, quickActionCount, " quick action", quickActionCount === 1 ? "" : "s")), /* @__PURE__ */ React.createElement("div", { className: "card-grid mt-4" }, [ADMIN_SHIFT_UTILITY_TEMPLATE, ...visibleTemplates].map((template) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: template.id,
        type: "button",
        onClick: () => applyTemplateToEditorDraft(template),
        disabled: isSavingTemplates,
        className: `brutal-btn card-frame card-size-1x1 ${template.accent || "bg-white"} p-3 text-left flex flex-col justify-between`
      },
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-title text-sm" }, template.label), /* @__PURE__ */ React.createElement("div", { className: "card-meta mt-2" }, template.clearSchedule ? "Stage this shift for removal" : `${template.schedIn} - ${template.schedOut}`)),
      /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow text-[#060606]/70" }, template.clearSchedule ? "Utility" : normalizeAdminScheduleStatus(template.scheduleStatus))
    ))))))));
  };
  function App() {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyQipNZW0DC8R0Etm_-giUXx-5pSt1bZTrUjikY7kgxmRyminft4xAiVNBpdHBb_NxgpA/exec";
    const employeeFetchErrorMessage = "Could not load employees. Please check the Google Sheet setup.";
    const BROWSER_ALERT_REFRESH_MS = 3e4;
    const notificationApiAvailable = typeof window !== "undefined" && "Notification" in window;
    const readStoredBrowserAlertPreference = () => {
      return notificationApiAvailable && Notification.permission === "granted";
    };
    const [currentTime, setCurrentTime] = useState(/* @__PURE__ */ new Date());
    const [viewMode, setViewMode] = useState("PINPAD");
    const [pinInput, setPinInput] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState({
      timeIn: "",
      timeInPeriod: "",
      timeOut: "",
      timeOutPeriod: "",
      oldReason: "",
      newReason: ""
    });
    const [employeeTimeOffDraft, setEmployeeTimeOffDraft] = useState(null);
    const [directoryMode, setDirectoryMode] = useState("employee");
    const [adminUser, setAdminUser] = useState(null);
    const [adminWeekStart, setAdminWeekStart] = useState(getWeekStartDate(/* @__PURE__ */ new Date()));
    const [adminScheduleDrafts, setAdminScheduleDrafts] = useState({});
    const [selectedAdminCell, setSelectedAdminCell] = useState(null);
    const [adminTemplateName, setAdminTemplateName] = useState("");
    const [adminTemplateDraft, setAdminTemplateDraft] = useState(buildEmptyAdminTemplateDraft());
    const lastActivityRef = useRef(Date.now());
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [hasAcknowledgedTimeoutWarning, setHasAcknowledgedTimeoutWarning] = useState(false);
    const INITIAL_IDLE_LIMIT = 30 * 1e3;
    const ADMIN_IDLE_LIMIT = 60 * 60 * 1e3;
    const EMPLOYEE_IDLE_LIMIT = 15 * 60 * 1e3;
    const WARNING_TIME = 15e3;
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [isFetchingLogs, setIsFetchingLogs] = useState(false);
    const [isFetchingInventory, setIsFetchingInventory] = useState(false);
    const [isFetchingMessages, setIsFetchingMessages] = useState(false);
    const [isFetchingPenHospital, setIsFetchingPenHospital] = useState(false);
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);
    const [isSubmittingInventory, setIsSubmittingInventory] = useState(false);
    const [isSubmittingAdminSchedule, setIsSubmittingAdminSchedule] = useState(false);
    const [isSubmittingEmployeeAdmin, setIsSubmittingEmployeeAdmin] = useState(false);
    const [isCreatingEmployeeAdmin, setIsCreatingEmployeeAdmin] = useState(false);
    const [isSavingShiftTemplates, setIsSavingShiftTemplates] = useState(false);
    const [isSubmittingTimeOff, setIsSubmittingTimeOff] = useState(false);
    const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
    const [isSubmittingPenHospital, setIsSubmittingPenHospital] = useState(false);
    const [reactingMessageRowNumber, setReactingMessageRowNumber] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [sheetData, setSheetData] = useState([]);
    const [inventoryRows, setInventoryRows] = useState([]);
    const [messages, setMessages] = useState([]);
    const [penHospitalCases, setPenHospitalCases] = useState([]);
    const [messageDraft, setMessageDraft] = useState("");
    const [browserNotificationPermission, setBrowserNotificationPermission] = useState(
      notificationApiAvailable ? Notification.permission : "unsupported"
    );
    const [browserAlertsEnabled, setBrowserAlertsEnabled] = useState(readStoredBrowserAlertPreference);
    const [midnightAutoClockOutAlert, setMidnightAutoClockOutAlert] = useState(null);
    const alertSnapshotsRef = useRef({
      messages: /* @__PURE__ */ new Map(),
      inventory: /* @__PURE__ */ new Map(),
      penHospital: /* @__PURE__ */ new Map()
    });
    const latestAlertDataRef = useRef({
      messages: [],
      inventoryRows: [],
      penHospitalCases: []
    });
    const isBackgroundAlertRefreshRef = useRef(false);
    const activeIdleLimit = !isAuthenticated ? null : hasAcknowledgedTimeoutWarning ? adminUser ? ADMIN_IDLE_LIMIT : EMPLOYEE_IDLE_LIMIT : INITIAL_IDLE_LIMIT;
    const timeoutCountdownSeconds = activeIdleLimit === null ? 0 : Math.max(0, Math.ceil((activeIdleLimit + WARNING_TIME - (currentTime.getTime() - lastActivityRef.current)) / 1e3));
    const timeoutResetLabel = adminUser ? "1 hour" : "15 minutes";
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
    const [settings, setSettings] = useState({
      companyName: "",
      logoUrl: "",
      shiftTemplates: []
    });
    const [notification, setNotification] = useState(null);
    const [reasonValidationTriggered, setReasonValidationTriggered] = useState(false);
    const buildApiUrl = (type) => `${scriptUrl}?type=${encodeURIComponent(type)}&_=${Date.now()}`;
    const refreshEmployees = async () => {
      const response = await fetch(buildApiUrl("employees"), { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      const formattedEmployees = data.map((emp) => ({ ...emp, isClockedIn: false }));
      setEmployees(formattedEmployees);
      setFetchError(null);
      return formattedEmployees;
    };
    const refreshSettings = async () => {
      try {
        const response = await fetch(buildApiUrl("settings"), { cache: "no-store" });
        if (!response.ok) return null;
        const data = await response.json();
        const nextSettings = {
          companyName: (data.companyName || "").trim(),
          logoUrl: data.logoUrl || "",
          shiftTemplates: normalizeAdminShiftTemplates(data.shiftTemplates)
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
        const response = await fetch(buildApiUrl("logs"), { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch timesheet rows");
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
        const response = await fetch(buildApiUrl("inventory"), { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch inventory rows");
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
        const response = await fetch(buildApiUrl("messages"), { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch messages");
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
        const response = await fetch(buildApiUrl("pen_hospital"), { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch Pen Hospital rows");
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
          refreshPenHospital({ showSpinner: false })
        ]);
        if (employeesResult.status === "rejected") {
          console.error("Error fetching employees:", employeesResult.reason);
          if (!hadEmployees) {
            setFetchError(employeeFetchErrorMessage);
          }
        }
        if (settingsResult.status === "rejected") {
          console.error("Error refreshing settings:", settingsResult.reason);
        }
        if (messagesResult.status === "rejected") {
          console.error("Error refreshing messages:", messagesResult.reason);
        }
        if (penHospitalResult.status === "rejected") {
          console.error("Error refreshing Pen Hospital:", penHospitalResult.reason);
        }
        rows = logsResult.status === "fulfilled" ? logsResult.value : null;
        inventory = inventoryResult.status === "fulfilled" ? inventoryResult.value : null;
        messageRows = messagesResult.status === "fulfilled" ? messagesResult.value : null;
        penHospital = penHospitalResult.status === "fulfilled" ? penHospitalResult.value : null;
      } finally {
        if (showSpinner) setIsFetchingLogs(false);
        if (showSpinner) setIsFetchingInventory(false);
        if (showSpinner) setIsFetchingMessages(false);
        if (showSpinner) setIsFetchingPenHospital(false);
        if (isInitialLoad) setIsLoadingEmployees(false);
      }
      if (showToast) {
        setNotification(
          rows || inventory || messageRows || penHospital ? { type: "info", message: "Latest spreadsheet updates loaded" } : { type: "error", message: "Could not pull the latest spreadsheet updates." }
        );
      }
      return { rows, inventory, messages: messageRows, penHospital };
    };
    const persistBrowserAlertPreference = (nextValue) => {
      setBrowserAlertsEnabled(nextValue);
    };
    const buildMessageAlertSnapshot = (rows) => {
      return new Map(
        (Array.isArray(rows) ? rows : []).map((row) => {
          const rowNumber = Number(row?.rowNumber || 0);
          return [
            rowNumber,
            {
              rowNumber,
              senderName: String(row?.senderName || "").trim(),
              message: String(row?.message || "").trim(),
              isoTimestamp: String(row?.isoTimestamp || "").trim()
            }
          ];
        }).filter(([rowNumber]) => rowNumber > 0)
      );
    };
    const buildInventoryAlertSnapshot = (rows) => {
      return new Map(
        (Array.isArray(rows) ? rows : []).map((row) => {
          const rowNumber = Number(row?.rowNumber || 0);
          return [
            rowNumber,
            {
              rowNumber,
              sku: getInventorySkuText(row),
              product: getInventoryNameText(row),
              status: String(row?.status || "").trim(),
              needed: Number(row?.needed || 0),
              stillNeeded: Number(row?.stillNeeded || 0),
              inProcess: Number(row?.inProcess || 0),
              awaitingApproval: Number(row?.awaitingApproval || 0),
              addedToStore: Number(row?.addedToStore || 0),
              lastUpdated: String(row?.lastUpdated || "").trim()
            }
          ];
        }).filter(([rowNumber]) => rowNumber > 0)
      );
    };
    const buildPenHospitalAlertSnapshot = (rows) => {
      return new Map(
        (Array.isArray(rows) ? rows : []).map((row) => {
          const rowNumber = Number(row?.rowNumber || 0);
          return [
            rowNumber,
            {
              rowNumber,
              customerName: String(row?.customerName || "").trim(),
              penNames: String(row?.penNames || "").trim(),
              expectedCount: Number(row?.expectedCount || 0),
              status: normalizePenHospitalStatus(row?.status),
              createdAtIso: String(row?.createdAtIso || "").trim(),
              lastUpdatedIso: String(row?.lastUpdatedIso || "").trim(),
              lastUpdated: String(row?.lastUpdated || "").trim()
            }
          ];
        }).filter(([rowNumber]) => rowNumber > 0)
      );
    };
    const getInventoryAlertLabel = (row) => {
      const sku = String(row?.sku || "").trim();
      const product = String(row?.product || "").trim();
      if (product && sku && sku !== "No SKU") return `${product} (${sku})`;
      return product || sku || "Inventory item";
    };
    const truncateAlertText = (value, maxLength = 120) => {
      const normalized = String(value || "").replace(/\s+/g, " ").trim();
      if (!normalized) return "";
      return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength - 1)}\u2026`;
    };
    const normalizeAlertPreview = (value, maxLength = 120) => {
      const normalized = String(value || "").replace(/\s+/g, " ").trim();
      if (!normalized) return "";
      return normalized.length <= maxLength ? normalized : `${normalized.slice(0, Math.max(0, maxLength - 3))}...`;
    };
    const isActionableInventoryAlertRow = (row) => {
      return Number(row?.stillNeeded || 0) > 0 || Number(row?.inProcess || 0) > 0 || Number(row?.awaitingApproval || 0) > 0;
    };
    const areInventoryAlertRowsEqual = (left, right) => {
      if (!left || !right) return false;
      return left.status === right.status && left.needed === right.needed && left.stillNeeded === right.stillNeeded && left.inProcess === right.inProcess && left.awaitingApproval === right.awaitingApproval && left.addedToStore === right.addedToStore && left.lastUpdated === right.lastUpdated && left.sku === right.sku && left.product === right.product;
    };
    const arePenHospitalAlertRowsEqual = (left, right) => {
      if (!left || !right) return false;
      return left.customerName === right.customerName && left.penNames === right.penNames && left.expectedCount === right.expectedCount && left.status === right.status && left.createdAtIso === right.createdAtIso && left.lastUpdatedIso === right.lastUpdatedIso && left.lastUpdated === right.lastUpdated;
    };
    const getBaseAdminScheduleDraft = (employeeName, dateValue, rows = sheetData) => {
      const sourceRow = getScheduleRowForEmployeeDate(rows, employeeName, dateValue);
      return sourceRow ? buildAdminScheduleDraftFromRow(sourceRow, employeeName, dateValue) : buildEmptyAdminScheduleForm(employeeName, dateValue);
    };
    const getAdminScheduleDraft = (employeeName, dateValue, draftMap = adminScheduleDrafts, rows = sheetData) => {
      const draftKey = buildScheduleCellKey(employeeName, dateValue);
      return draftMap[draftKey] || getBaseAdminScheduleDraft(employeeName, dateValue, rows);
    };
    const updateAdminScheduleDraft = (employeeName, dateValue, patch) => {
      const normalizedDate = normalizeDate(dateValue);
      setAdminScheduleDrafts((prev) => {
        const draftKey = buildScheduleCellKey(employeeName, normalizedDate);
        const baseDraft = getBaseAdminScheduleDraft(employeeName, normalizedDate);
        const currentDraft = prev[draftKey] || baseDraft;
        const nextDraft = typeof patch === "function" ? patch(currentDraft) : { ...currentDraft, ...patch };
        const normalizedDraft = {
          ...nextDraft,
          name: employeeName,
          date: normalizedDate,
          sourceRow: nextDraft?.sourceRow === void 0 ? currentDraft.sourceRow || baseDraft.sourceRow || null : nextDraft.sourceRow
        };
        if (areAdminScheduleDraftsEquivalent(normalizedDraft, baseDraft)) {
          const { [draftKey]: _removed, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [draftKey]: normalizedDraft
        };
      });
    };
    const applyTemplateToAdminSchedule = (employeeName, dateValue, templateId) => {
      const template = getVisibleAdminShiftTemplates(settings.shiftTemplates).find((item) => item.id === templateId);
      if (!template) return;
      updateAdminScheduleDraft(employeeName, dateValue, (currentDraft) => {
        if (template.clearSchedule) {
          return {
            ...currentDraft,
            schedIn: "",
            schedInPeriod: "AM",
            schedOut: "",
            schedOutPeriod: "PM",
            scheduleStatus: "",
            clearSchedule: true
          };
        }
        const parsedIn = parseTimeField(template.schedIn);
        const parsedOut = parseTimeField(template.schedOut);
        return {
          ...currentDraft,
          schedIn: parsedIn.time,
          schedInPeriod: parsedIn.period || "AM",
          schedOut: parsedOut.time,
          schedOutPeriod: parsedOut.period || "PM",
          scheduleStatus: normalizeAdminScheduleStatus(template.scheduleStatus),
          clearSchedule: false
        };
      });
    };
    const selectAdminCell = (employeeName, dateValue) => {
      setSelectedAdminCell({
        name: employeeName,
        date: normalizeDate(dateValue)
      });
    };
    const loadSavedWeekIntoAdminSchedule = (sourceWeekStart) => {
      if (!sourceWeekStart) return;
      const normalizedSourceWeekStart = normalizeDate(getWeekStartDate(sourceWeekStart));
      const normalizedTargetWeekStart = normalizeDate(getWeekStartDate(adminWeekStart));
      if (normalizedSourceWeekStart === normalizedTargetWeekStart) {
        setNotification({
          type: "info",
          message: "That week is already on screen. Pick a different saved week to copy from."
        });
        return;
      }
      const sourceWeekDays = buildWeekDays(normalizedSourceWeekStart);
      const targetWeekDays = buildWeekDays(normalizedTargetWeekStart);
      const schedulableEmployees = sortEmployeesForDisplay(
        employees.filter((emp) => !isAdminRole(emp?.role) && isEmployeeActive(emp))
      );
      const nextDrafts = { ...adminScheduleDrafts };
      let stagedCount = 0;
      let skippedTimeOffCount = 0;
      targetWeekDays.forEach((targetDay, dayIndex) => {
        const targetDayKey = normalizeDate(targetDay);
        const sourceDayKey = normalizeDate(sourceWeekDays[dayIndex]);
        schedulableEmployees.forEach((employee) => {
          const employeeName = String(employee?.name || "").trim();
          if (!employeeName) return;
          const draftKey = buildScheduleCellKey(employeeName, targetDayKey);
          const baseDraft = getBaseAdminScheduleDraft(employeeName, targetDayKey, sheetData);
          const targetTimeOffRow = getTimeOffRowForEmployeeDate(sheetData, employeeName, targetDayKey);
          const sourceRow = getSavedScheduleRowForEmployeeDate(sheetData, employeeName, sourceDayKey);
          const sourceHasShift = Boolean(sourceRow && (hasTimeValue(sourceRow.schedIn) || hasTimeValue(sourceRow.schedOut)));
          const baseHasShift = Boolean(hasTimeValue(baseDraft.schedIn) || hasTimeValue(baseDraft.schedOut));
          if (targetTimeOffRow) {
            if (sourceHasShift || baseHasShift) {
              skippedTimeOffCount += 1;
            }
            return;
          }
          if (sourceHasShift) {
            const parsedIn = parseTimeField(sourceRow.schedIn || "");
            const parsedOut = parseTimeField(sourceRow.schedOut || "");
            const importedDraft = {
              ...baseDraft,
              name: employeeName,
              date: targetDayKey,
              schedIn: parsedIn.time,
              schedInPeriod: parsedIn.period || "AM",
              schedOut: parsedOut.time,
              schedOutPeriod: parsedOut.period || "PM",
              scheduleStatus: normalizeAdminScheduleStatus(sourceRow.scheduleStatus),
              clearSchedule: false,
              sourceRow: baseDraft.sourceRow || null
            };
            if (areAdminScheduleDraftsEquivalent(importedDraft, baseDraft)) {
              delete nextDrafts[draftKey];
              return;
            }
            nextDrafts[draftKey] = importedDraft;
            stagedCount += 1;
            return;
          }
          if (baseHasShift) {
            const clearedDraft = {
              ...baseDraft,
              name: employeeName,
              date: targetDayKey,
              schedIn: "",
              schedInPeriod: "AM",
              schedOut: "",
              schedOutPeriod: "PM",
              scheduleStatus: "",
              clearSchedule: true,
              sourceRow: baseDraft.sourceRow || null
            };
            nextDrafts[draftKey] = clearedDraft;
            stagedCount += 1;
            return;
          }
          delete nextDrafts[draftKey];
        });
      });
      setAdminScheduleDrafts(nextDrafts);
      setSelectedAdminCell(null);
      if (stagedCount === 0) {
        setNotification({
          type: skippedTimeOffCount > 0 ? "info" : "error",
          message: skippedTimeOffCount > 0 ? `No shifts were staged because ${skippedTimeOffCount} target cell${skippedTimeOffCount === 1 ? " is" : "s are"} blocked by time off.` : "That saved week did not create any new staged changes."
        });
        return;
      }
      setNotification({
        type: "success",
        message: `Loaded ${stagedCount} shift change${stagedCount === 1 ? "" : "s"} from ${formatWeekRangeLabel(normalizedSourceWeekStart)}. Review the board, then click Save All.${skippedTimeOffCount > 0 ? ` ${skippedTimeOffCount} time-off block${skippedTimeOffCount === 1 ? " was" : "s were"} skipped.` : ""}`
      });
    };
    const persistAdminShiftTemplates = async (nextTemplates, successMessage) => {
      if (!adminUser || !isAdminRole(adminUser.role) || isSavingShiftTemplates) return false;
      setIsSavingShiftTemplates(true);
      try {
        const payloadTemplates = normalizeAdminShiftTemplates(nextTemplates).map((template) => ({
          id: template.id,
          label: template.label,
          schedIn: template.schedIn,
          schedOut: template.schedOut,
          scheduleStatus: normalizeAdminScheduleStatus(template.scheduleStatus)
        }));
        const result = await sendToSheet({
          action: "SAVE_SHIFT_TEMPLATES",
          editorName: adminUser.name,
          editorRole: adminUser.role || "admin",
          shiftTemplates: payloadTemplates
        });
        if (!result.ok) {
          setNotification({ type: "error", message: result.error || "Could not save the shift templates." });
          return false;
        }
        const savedTemplates = normalizeAdminShiftTemplates(result?.parsed?.shiftTemplates || payloadTemplates);
        setSettings((prev) => ({
          ...prev,
          shiftTemplates: savedTemplates
        }));
        setNotification({ type: "success", message: successMessage });
        return true;
      } catch (err) {
        console.error("Shift template save failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted the template save." });
        return false;
      } finally {
        setIsSavingShiftTemplates(false);
      }
    };
    const saveSelectedShiftAsTemplate = async (draftOverride = null, nameOverride = void 0) => {
      const templateDraftSource = draftOverride || adminTemplateDraft;
      const templateNameSource = nameOverride === void 0 ? adminTemplateName : nameOverride;
      const label = String(templateNameSource || "").trim();
      if (!label) {
        setNotification({ type: "error", message: "Enter a template name first." });
        return;
      }
      const schedIn = formatTimeField(templateDraftSource.schedIn, templateDraftSource.schedInPeriod);
      const schedOut = formatTimeField(templateDraftSource.schedOut, templateDraftSource.schedOutPeriod);
      if (!schedIn || !schedOut) {
        setNotification({ type: "error", message: "Enter valid scheduled in and out times before saving a template." });
        return;
      }
      const normalizedTemplates = normalizeAdminShiftTemplates(settings.shiftTemplates);
      const existingIndex = normalizedTemplates.findIndex(
        (template) => String(template.label || "").trim().toLowerCase() === label.toLowerCase()
      );
      const nextTemplate = {
        id: existingIndex >= 0 ? normalizedTemplates[existingIndex].id : buildShiftTemplateId(label),
        label,
        schedIn,
        schedOut,
        scheduleStatus: normalizeAdminScheduleStatus(templateDraftSource.scheduleStatus)
      };
      const nextTemplates = existingIndex >= 0 ? normalizedTemplates.map((template, index) => index === existingIndex ? nextTemplate : template) : [...normalizedTemplates, nextTemplate];
      const didSave = await persistAdminShiftTemplates(
        nextTemplates,
        existingIndex >= 0 ? `Template updated: ${label}` : `Template saved: ${label}`
      );
      if (didSave) {
        setAdminTemplateName("");
        setAdminTemplateDraft(buildEmptyAdminTemplateDraft());
      }
    };
    const deleteAdminShiftTemplate = async (templateId) => {
      const normalizedTemplates = normalizeAdminShiftTemplates(settings.shiftTemplates);
      const targetTemplate = normalizedTemplates.find((template) => template.id === templateId);
      if (!targetTemplate) return;
      const didSave = await persistAdminShiftTemplates(
        normalizedTemplates.filter((template) => template.id !== templateId),
        `Template removed: ${targetTemplate.label}`
      );
      if (didSave && String(adminTemplateName || "").trim().toLowerCase() === String(targetTemplate.label || "").trim().toLowerCase()) {
        setAdminTemplateName("");
      }
    };
    useEffect(() => {
      const fetchData = async () => {
        await refreshSheetData(false, { showSpinner: false, isInitialLoad: true });
      };
      fetchData();
    }, []);
    useEffect(() => {
      if (notification) {
        const timer = setTimeout(() => setNotification(null), 4e3);
        return () => clearTimeout(timer);
      }
    }, [notification]);
    useEffect(() => {
      if (!notificationApiAvailable) {
        setBrowserNotificationPermission("unsupported");
        return void 0;
      }
      const syncBrowserNotificationPermission = () => {
        const nextPermission = Notification.permission;
        setBrowserNotificationPermission(nextPermission);
        if (nextPermission === "granted" && !browserAlertsEnabled) {
          persistBrowserAlertPreference(true);
        }
        if (nextPermission !== "granted" && browserAlertsEnabled) {
          persistBrowserAlertPreference(false);
        }
      };
      syncBrowserNotificationPermission();
      window.addEventListener("focus", syncBrowserNotificationPermission);
      document.addEventListener("visibilitychange", syncBrowserNotificationPermission);
      return () => {
        window.removeEventListener("focus", syncBrowserNotificationPermission);
        document.removeEventListener("visibilitychange", syncBrowserNotificationPermission);
      };
    }, [notificationApiAvailable, browserAlertsEnabled]);
    const handleSelectionCancel = () => {
      setSelectedId(null);
      setPinInput("");
      setIsAuthenticated(false);
      setAdminUser(null);
      setViewMode("PINPAD");
      setEditTarget(null);
      setEmployeeTimeOffDraft(null);
      setMessageDraft("");
      setMidnightAutoClockOutAlert(null);
      setReactingMessageRowNumber(null);
      setReasonValidationTriggered(false);
      clearSessionTimeoutState();
    };
    const handleLogout = () => {
      handleSelectionCancel();
      setDirectoryMode("employee");
      setAdminWeekStart(getWeekStartDate(/* @__PURE__ */ new Date()));
      setAdminScheduleDrafts({});
      setSelectedAdminCell(null);
      setAdminTemplateName("");
      setAdminTemplateDraft(buildEmptyAdminTemplateDraft());
    };
    const openAdminDirectory = async () => {
      handleSelectionCancel();
      setDirectoryMode("admin");
      setAdminTemplateName("");
      setAdminTemplateDraft(buildEmptyAdminTemplateDraft());
      await refreshSheetData(false, { showSpinner: false });
    };
    const returnToEmployeeDirectory = () => {
      handleSelectionCancel();
      setDirectoryMode("employee");
      setAdminWeekStart(getWeekStartDate(/* @__PURE__ */ new Date()));
      setAdminScheduleDrafts({});
      setSelectedAdminCell(null);
      setAdminTemplateName("");
      setAdminTemplateDraft(buildEmptyAdminTemplateDraft());
    };
    useEffect(() => {
      const handleActivity = () => {
        if (!showTimeoutWarning) {
          lastActivityRef.current = Date.now();
        }
      };
      window.addEventListener("click", handleActivity);
      window.addEventListener("keypress", handleActivity);
      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("touchstart", handleActivity);
      return () => {
        window.removeEventListener("click", handleActivity);
        window.removeEventListener("keypress", handleActivity);
        window.removeEventListener("mousemove", handleActivity);
        window.removeEventListener("touchstart", handleActivity);
      };
    }, [showTimeoutWarning]);
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(/* @__PURE__ */ new Date());
        if (isAuthenticated) {
          if (activeIdleLimit === null) {
            setShowTimeoutWarning(false);
            lastActivityRef.current = Date.now();
            return;
          }
          const idleTime = Date.now() - lastActivityRef.current;
          if (idleTime >= activeIdleLimit + WARNING_TIME) {
            handleLogout();
            setNotification({ type: "info", message: "Session timed out due to inactivity" });
          } else if (idleTime >= activeIdleLimit) {
            setShowTimeoutWarning(true);
          }
        } else {
          setShowTimeoutWarning(false);
          lastActivityRef.current = Date.now();
        }
      }, 1e3);
      return () => clearInterval(timer);
    }, [isAuthenticated, activeIdleLimit]);
    const selectedUser = employees.find((e) => e.id === selectedId) || null;
    const selectedEmployee = selectedUser && !isAdminRole(selectedUser.role) ? selectedUser : null;
    const activeSessionUser = adminUser || selectedEmployee || null;
    const activeMessageViewer = adminUser || selectedEmployee || null;
    const publicEmployees = sortEmployeesForDisplay(
      employees.filter((emp) => !isAdminRole(emp.role) && isEmployeeActive(emp))
    );
    const adminAccounts = sortEmployeesForDisplay(
      employees.filter((emp) => isAdminRole(emp.role) && isEmployeeActive(emp))
    );
    const directoryEmployees = directoryMode === "admin" ? adminAccounts : publicEmployees;
    const personalData = selectedEmployee ? sheetData.filter((row) => row.name === selectedEmployee.name) : [];
    const activeEmployeeTimeOffRow = selectedEmployee && employeeTimeOffDraft ? getTimeOffRowForEmployeeDate(sheetData, selectedEmployee.name, employeeTimeOffDraft.date) : null;
    const todayKey = normalizeDate(/* @__PURE__ */ new Date());
    const savedWeekOptions = Object.values(
      sheetData.reduce((acc, row) => {
        if (isTimeOffRow(row)) return acc;
        if (!hasTimeValue(row.schedIn) && !hasTimeValue(row.schedOut)) return acc;
        const weekStartDate = getWeekStartDate(row.date);
        const weekKey = normalizeDate(weekStartDate);
        if (!acc[weekKey]) {
          const weekEndDate = new Date(weekStartDate);
          weekEndDate.setDate(weekEndDate.getDate() + 6);
          acc[weekKey] = {
            weekKey,
            label: `${formatMonthDayDate(weekStartDate)} - ${formatMonthDayDate(weekEndDate)}`,
            shiftCount: 0
          };
        }
        acc[weekKey].shiftCount += 1;
        return acc;
      }, {})
    ).sort((a, b) => b.weekKey.localeCompare(a.weekKey));
    const stagedScheduleChangeCount = Object.keys(adminScheduleDrafts).length;
    const inventoryOpenRows = sortInventoryRows(getOpenInventoryRows(inventoryRows));
    const inventoryAwaitingRows = inventoryOpenRows.filter((row) => Number(row.awaitingApproval || 0) > 0);
    const isAdminWorkspaceOpen = Boolean(isAuthenticated && adminUser && ["ADMIN", "ADMIN_INVENTORY", "ADMIN_PEN_HOSPITAL", "ADMIN_PAYROLL", "ADMIN_MESSAGES", "ADMIN_EMPLOYEES"].includes(viewMode));
    const editableRows = filterTimesheetRowsUpToToday(personalData).filter((row) => !isEntryLocked(row)).slice().sort((a, b) => {
      const aDate = parseLocalDate(a.date);
      const bDate = parseLocalDate(b.date);
      const aTime = isNaN(aDate.getTime()) ? 0 : aDate.getTime();
      const bTime = isNaN(bDate.getTime()) ? 0 : bDate.getTime();
      return aTime - bTime;
    });
    const editTargetIndex = editTarget ? editableRows.findIndex((row) => isSameTimesheetEntry(row, editTarget)) : -1;
    const canEditPrev = editTargetIndex > 0;
    const canEditNext = editTargetIndex >= 0 && editTargetIndex < editableRows.length - 1;
    const selectedClockInPlan = selectedEmployee ? resolveClockInPlan(sheetData, selectedEmployee.name, todayKey) : null;
    const selectedClockOutPlan = selectedEmployee ? resolveClockOutPlan(sheetData, selectedEmployee.name, todayKey) : null;
    const completedMidnightAutoClockOutAlertPlan = selectedEmployee && midnightAutoClockOutAlert && midnightAutoClockOutAlert.employeeName === selectedEmployee.name ? { code: "midnight-auto-clock-out", message: midnightAutoClockOutAlert.message } : null;
    const blockedActionAlertPlan = [selectedClockInPlan, selectedClockOutPlan].find(
      (plan) => plan && plan.status === "blocked" && !["already-clocked-in", "no-open-shift"].includes(plan.code) && !(plan.code === "prior-open-shift" && selectedClockInPlan?.autoClockOut)
    ) || null;
    const pendingMidnightAutoClockOutAlertPlan = selectedClockInPlan?.status === "ready" && selectedClockInPlan?.autoClockOut ? { code: "midnight-auto-clock-out-pending", message: selectedClockInPlan.autoClockOut.previewMessage } : null;
    const actionAlertPlan = completedMidnightAutoClockOutAlertPlan || blockedActionAlertPlan || pendingMidnightAutoClockOutAlertPlan || null;
    const canClockIn = Boolean(selectedEmployee) && !isSubmittingAction && selectedClockInPlan?.status === "ready";
    const canClockOut = Boolean(selectedEmployee) && !isSubmittingAction && selectedClockOutPlan?.status === "ready";
    const browserAlertsActive = Boolean(
      browserAlertsEnabled && browserNotificationPermission === "granted"
    );
    const syncAlertSnapshotsFromState = () => {
      alertSnapshotsRef.current = {
        messages: buildMessageAlertSnapshot(messages),
        inventory: buildInventoryAlertSnapshot(inventoryRows),
        penHospital: buildPenHospitalAlertSnapshot(penHospitalCases)
      };
    };
    useEffect(() => {
      latestAlertDataRef.current = {
        messages,
        inventoryRows,
        penHospitalCases
      };
      if (isBackgroundAlertRefreshRef.current) return;
      syncAlertSnapshotsFromState();
    }, [messages, inventoryRows, penHospitalCases]);
    const openAlertDestination = (channel) => {
      if (!isAuthenticated) {
        handleSelectionCancel();
        setDirectoryMode("employee");
        return;
      }
      lastActivityRef.current = Date.now();
      setEmployeeTimeOffDraft(null);
      if (adminUser) {
        if (channel === "messages") setViewMode("ADMIN_MESSAGES");
        if (channel === "inventory") setViewMode("ADMIN_INVENTORY");
        if (channel === "pen_hospital") setViewMode("ADMIN_PEN_HOSPITAL");
        return;
      }
      if (channel === "messages") setViewMode("MESSAGES");
      if (channel === "inventory") setViewMode("INVENTORY");
      if (channel === "pen_hospital") setViewMode("PEN_HOSPITAL");
    };
    const emitAttentionAlert = (alert) => {
      if (!alert) return;
      const pageVisible = typeof document !== "undefined" && document.visibilityState === "visible" && (typeof document.hasFocus === "function" ? document.hasFocus() : true);
      if (pageVisible) {
        setNotification({ type: "info", message: alert.inAppMessage || alert.body || alert.title });
        return;
      }
      if (!notificationApiAvailable || browserNotificationPermission !== "granted") return;
      try {
        const browserAlert = new Notification(alert.title, {
          body: alert.body,
          icon: settings.logoUrl || void 0,
          tag: `timeclock-${alert.channel}`,
          renotify: true
        });
        browserAlert.onclick = (event) => {
          if (event?.preventDefault) event.preventDefault();
          window.focus();
          openAlertDestination(alert.channel);
          browserAlert.close();
        };
      } catch (error) {
        console.error("Browser alert failed:", error);
      }
    };
    const buildMessageAlertPayload = (previousSnapshot, nextRows) => {
      const nextSnapshot = buildMessageAlertSnapshot(nextRows);
      const newMessages = Array.from(nextSnapshot.values()).filter((messageRow) => !previousSnapshot.has(messageRow.rowNumber)).sort((a, b) => a.rowNumber - b.rowNumber);
      if (newMessages.length === 0) {
        return { snapshot: nextSnapshot, alert: null };
      }
      const latestMessage = newMessages[newMessages.length - 1];
      const senderName = latestMessage.senderName || "Team";
      const messageCount = newMessages.length;
      const messagePreview = normalizeAlertPreview(latestMessage.message || "Open Messages to read the latest update.");
      return {
        snapshot: nextSnapshot,
        alert: {
          channel: "messages",
          title: messageCount === 1 ? `New message from ${senderName}` : `${messageCount} new messages`,
          body: messageCount === 1 ? messagePreview || "Open Messages to read the latest update." : `${senderName} posted the latest note. Open Messages to catch up.`,
          inAppMessage: messageCount === 1 ? `New message from ${senderName}.` : `${messageCount} new messages were posted.`
        }
      };
    };
    const buildInventoryAlertPayload = (previousSnapshot, nextRows) => {
      const nextSnapshot = buildInventoryAlertSnapshot(nextRows);
      const changedRows = Array.from(nextSnapshot.values()).map((row) => ({
        row,
        previousRow: previousSnapshot.get(row.rowNumber) || null
      })).filter(({ row, previousRow }) => {
        if (!previousRow) return isActionableInventoryAlertRow(row);
        if (areInventoryAlertRowsEqual(previousRow, row)) return false;
        return isActionableInventoryAlertRow(row) || isActionableInventoryAlertRow(previousRow);
      });
      if (changedRows.length === 0) {
        return { snapshot: nextSnapshot, alert: null };
      }
      const awaitingApprovalChange = changedRows.find(
        ({ row, previousRow }) => Number(row.awaitingApproval || 0) > Number(previousRow?.awaitingApproval || 0)
      );
      const createdChange = changedRows.find(({ previousRow }) => !previousRow);
      const statusChange = changedRows.find(
        ({ row, previousRow }) => previousRow && row.status !== previousRow.status
      );
      const topChange = awaitingApprovalChange || createdChange || statusChange || changedRows[0];
      const topLabel = getInventoryAlertLabel(topChange.row);
      let title = "Inventory board updated";
      let body = changedRows.length === 1 ? `${topLabel} was updated.` : `${changedRows.length} inventory items changed.`;
      if (awaitingApprovalChange) {
        title = "Inventory approval needed";
        body = `${topLabel} has ${topChange.row.awaitingApproval} awaiting approval${changedRows.length > 1 ? `, plus ${changedRows.length - 1} other update${changedRows.length === 2 ? "" : "s"}` : ""}.`;
      } else if (createdChange) {
        title = "New inventory need";
        body = `${topLabel} now shows ${topChange.row.stillNeeded || topChange.row.needed} still needed${changedRows.length > 1 ? `, plus ${changedRows.length - 1} other update${changedRows.length === 2 ? "" : "s"}` : ""}.`;
      } else if (statusChange) {
        title = "Inventory updated";
        body = `${topLabel} is now ${topChange.row.status || "updated"}${changedRows.length > 1 ? `, plus ${changedRows.length - 1} other update${changedRows.length === 2 ? "" : "s"}` : ""}.`;
      }
      return {
        snapshot: nextSnapshot,
        alert: {
          channel: "inventory",
          title,
          body,
          inAppMessage: body
        }
      };
    };
    const buildPenHospitalAlertPayload = (previousSnapshot, nextRows) => {
      const nextSnapshot = buildPenHospitalAlertSnapshot(nextRows);
      const changedRows = Array.from(nextSnapshot.values()).map((row) => ({
        row,
        previousRow: previousSnapshot.get(row.rowNumber) || null
      })).filter(({ row, previousRow }) => {
        if (!previousRow) return true;
        return !arePenHospitalAlertRowsEqual(previousRow, row);
      });
      if (changedRows.length === 0) {
        return { snapshot: nextSnapshot, alert: null };
      }
      const createdChange = changedRows.find(({ previousRow }) => !previousRow);
      const statusChange = changedRows.find(
        ({ row, previousRow }) => previousRow && row.status !== previousRow.status
      );
      const topChange = createdChange || statusChange || changedRows[0];
      const customerName = topChange.row.customerName || "A customer";
      let title = "Pen Hospital updated";
      let body = changedRows.length === 1 ? `${customerName} was updated in Pen Hospital.` : `${changedRows.length} Pen Hospital cases changed.`;
      if (createdChange) {
        title = "New Pen Hospital case";
        body = `${customerName} was added${topChange.row.expectedCount ? ` with ${topChange.row.expectedCount} expected` : ""}${changedRows.length > 1 ? `, plus ${changedRows.length - 1} other update${changedRows.length === 2 ? "" : "s"}` : ""}.`;
      } else if (statusChange) {
        title = "Pen Hospital status changed";
        body = `${customerName} is now ${topChange.row.status}${changedRows.length > 1 ? `, plus ${changedRows.length - 1} other update${changedRows.length === 2 ? "" : "s"}` : ""}.`;
      }
      return {
        snapshot: nextSnapshot,
        alert: {
          channel: "pen_hospital",
          title,
          body,
          inAppMessage: body
        }
      };
    };
    const pollBrowserAlertSources = async () => {
      if (!browserAlertsActive || isBackgroundAlertRefreshRef.current) return;
      isBackgroundAlertRefreshRef.current = true;
      const previousSnapshots = alertSnapshotsRef.current;
      try {
        const [nextMessages, nextInventory, nextPenHospital] = await Promise.all([
          refreshMessages({ showSpinner: false }),
          refreshInventory({ showSpinner: false }),
          refreshPenHospital({ showSpinner: false })
        ]);
        const messageResult = buildMessageAlertPayload(previousSnapshots.messages, nextMessages || latestAlertDataRef.current.messages);
        const inventoryResult = buildInventoryAlertPayload(previousSnapshots.inventory, nextInventory || latestAlertDataRef.current.inventoryRows);
        const penHospitalResult = buildPenHospitalAlertPayload(previousSnapshots.penHospital, nextPenHospital || latestAlertDataRef.current.penHospitalCases);
        alertSnapshotsRef.current = {
          messages: messageResult.snapshot,
          inventory: inventoryResult.snapshot,
          penHospital: penHospitalResult.snapshot
        };
        [messageResult.alert, inventoryResult.alert, penHospitalResult.alert].filter(Boolean).forEach(emitAttentionAlert);
      } finally {
        isBackgroundAlertRefreshRef.current = false;
      }
    };
    useEffect(() => {
      if (!browserAlertsActive) return void 0;
      syncAlertSnapshotsFromState();
      const timer = setInterval(() => {
        pollBrowserAlertSources();
      }, BROWSER_ALERT_REFRESH_MS);
      return () => clearInterval(timer);
    }, [browserAlertsActive]);
    const enableBrowserAlerts = async () => {
      if (!notificationApiAvailable) {
        setNotification({ type: "error", message: "This browser does not support notifications for this app." });
        return;
      }
      let nextPermission = Notification.permission;
      setBrowserNotificationPermission(nextPermission);
      if (nextPermission === "denied") {
        persistBrowserAlertPreference(false);
        setNotification({ type: "error", message: "Browser alerts are blocked. Allow notifications in your browser settings, then try again." });
        return;
      }
      if (nextPermission !== "granted") {
        nextPermission = await Notification.requestPermission();
        setBrowserNotificationPermission(nextPermission);
      }
      if (nextPermission !== "granted") {
        persistBrowserAlertPreference(false);
        setNotification({ type: "info", message: "Browser alerts were not enabled." });
        return;
      }
      persistBrowserAlertPreference(true);
      syncAlertSnapshotsFromState();
      setNotification({
        type: "success",
        message: "Browser alerts enabled."
      });
    };
    const requestBrowserAlerts = async () => {
      await enableBrowserAlerts();
    };
    const renderBrowserAlertControl = () => {
      if (!adminUser || !notificationApiAvailable || browserNotificationPermission === "granted") return null;
      const buttonClass = browserNotificationPermission === "denied" ? "bg-[#fecdd3] hover:bg-[#fda4af]" : "bg-[#bae6fd] hover:bg-[#7dd3fc]";
      const buttonLabel = browserNotificationPermission === "denied" ? "Alerts Blocked" : "Enable Alerts";
      return /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex justify-center" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: requestBrowserAlerts,
          className: `brutal-btn action-button action-button-fluid ${buttonClass}`
        },
        /* @__PURE__ */ React.createElement("i", { className: "fas fa-bell" }),
        /* @__PURE__ */ React.createElement("span", null, buttonLabel)
      ));
    };
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
          timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes
        });
        if (!result.ok) {
          setNotification({ type: "error", message: result.error || "Could not save the inventory update." });
          return false;
        }
        const refreshedInventory = await refreshInventory({ showSpinner: false });
        if (refreshedInventory) {
          setNotification({ type: "success", message: successMessage });
        } else {
          setNotification({
            type: "info",
            message: fallbackSuccessMessage || `${successMessage}. The latest inventory rows could not be reloaded automatically.`
          });
        }
        return true;
      } catch (err) {
        console.error("Inventory action failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted this inventory update." });
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
          timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes
        });
        if (!result.ok) {
          setNotification({ type: "error", message: result.error || "Could not save the Pen Hospital update." });
          return false;
        }
        const refreshedCases = await refreshPenHospital({ showSpinner: false });
        if (refreshedCases) {
          setNotification({ type: "success", message: successMessage });
        } else {
          setNotification({
            type: "info",
            message: fallbackSuccessMessage || `${successMessage}. The latest Pen Hospital board could not be reloaded automatically.`
          });
        }
        return true;
      } catch (err) {
        console.error("Pen Hospital action failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted the Pen Hospital update." });
        return false;
      } finally {
        setIsSubmittingPenHospital(false);
      }
    };
    const handleOpenEmployeeInventory = async () => {
      setEmployeeTimeOffDraft(null);
      setViewMode("INVENTORY");
      await refreshInventory({ showSpinner: false });
    };
    const handleOpenEmployeePenHospital = async () => {
      setEmployeeTimeOffDraft(null);
      setViewMode("PEN_HOSPITAL");
      const rows = await refreshPenHospital({ showSpinner: false });
      if (rows === null) {
        setNotification({ type: "error", message: "Could not load the Pen Hospital board right now." });
      }
    };
    const handleOpenEmployeeMessages = async () => {
      setEmployeeTimeOffDraft(null);
      setViewMode("MESSAGES");
      const rows = await refreshMessages({ showSpinner: false });
      if (rows === null) {
        setNotification({ type: "error", message: "Could not load messages. If the web app was redeployed recently, make sure the latest Apps Script version was deployed." });
      }
    };
    const handleOpenEmployeeSchedule = async () => {
      setViewMode("SCHEDULE");
      await refreshLogs({ showSpinner: false });
    };
    const handleOpenEmployeeTimesheet = async () => {
      setEmployeeTimeOffDraft(null);
      setViewMode("TIMESHEET");
      await refreshLogs({ showSpinner: false });
    };
    const handleOpenAdminInventory = async () => {
      setEmployeeTimeOffDraft(null);
      setViewMode("ADMIN_INVENTORY");
      await refreshInventory({ showSpinner: false });
    };
    const handleOpenAdminPenHospital = async () => {
      setEmployeeTimeOffDraft(null);
      setViewMode("ADMIN_PEN_HOSPITAL");
      const rows = await refreshPenHospital({ showSpinner: false });
      if (rows === null) {
        setNotification({ type: "error", message: "Could not load the Pen Hospital board right now." });
      }
    };
    const handleOpenAdminPayroll = async () => {
      setEmployeeTimeOffDraft(null);
      setViewMode("ADMIN_PAYROLL");
      await refreshLogs({ showSpinner: false });
    };
    const handleOpenAdminEmployees = async () => {
      setEmployeeTimeOffDraft(null);
      setViewMode("ADMIN_EMPLOYEES");
      await refreshEmployees();
    };
    const handleOpenAdminMessages = async () => {
      setEmployeeTimeOffDraft(null);
      setViewMode("ADMIN_MESSAGES");
      const rows = await refreshMessages({ showSpinner: false });
      if (rows === null) {
        setNotification({ type: "error", message: "Could not load messages. If the web app was redeployed recently, make sure the latest Apps Script version was deployed." });
      }
    };
    const openEmployeeTimeOffRequest = (dateValue) => {
      if (!selectedEmployee) return;
      const existingRow = getTimeOffRowForEmployeeDate(sheetData, selectedEmployee.name, dateValue);
      setEmployeeTimeOffDraft(
        existingRow ? buildTimeOffRequestDraftFromRow(existingRow, dateValue) : buildEmptyTimeOffRequestDraft(dateValue)
      );
    };
    const closeEmployeeTimeOffRequest = () => {
      setEmployeeTimeOffDraft(null);
    };
    const submitEmployeeTimeOffRequest = async () => {
      if (!selectedEmployee || !employeeTimeOffDraft || isSubmittingTimeOff) return false;
      const formattedIn = employeeTimeOffDraft.fullDay ? "" : formatTimeField(employeeTimeOffDraft.schedIn, employeeTimeOffDraft.schedInPeriod);
      const formattedOut = employeeTimeOffDraft.fullDay ? "" : formatTimeField(employeeTimeOffDraft.schedOut, employeeTimeOffDraft.schedOutPeriod);
      const isValidRange = employeeTimeOffDraft.fullDay ? true : Boolean(formattedIn && formattedOut && calculateWorkedMinutes(formattedIn, formattedOut));
      if (isPastScheduleDate(employeeTimeOffDraft.date)) {
        setNotification({ type: "error", message: "Time off can only be requested for today or a future date." });
        return false;
      }
      if (!isValidRange) {
        setNotification({ type: "error", message: "Enter a valid blocked time range before sending this request." });
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
          schedIn: employeeTimeOffDraft.fullDay ? "" : formattedIn,
          schedOut: employeeTimeOffDraft.fullDay ? "" : formattedOut,
          editorName: selectedEmployee.name,
          editorRole: selectedEmployee.role || "employee",
          submittedAt: timestamp.isoTimestamp,
          timezone: timestamp.timezone,
          timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes,
          ...buildRowContextPayload(latestRequestRow)
        });
        if (!result.ok) {
          setNotification({ type: "error", message: result.error || "Could not save the time-off request." });
          return false;
        }
        const refreshedRows = await refreshLogs({ showSpinner: false });
        if (refreshedRows) {
          setNotification({ type: "success", message: `Time-off request sent for ${formatFullDate(employeeTimeOffDraft.date)}.` });
        } else {
          setNotification({ type: "info", message: "The request was sent, but the latest schedule rows could not be reloaded automatically." });
        }
        setEmployeeTimeOffDraft(null);
        return true;
      } catch (err) {
        console.error("Time-off request failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted the time-off request." });
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
          editorRole: adminUser.role || "admin",
          submittedAt: timestamp.isoTimestamp,
          timezone: timestamp.timezone,
          timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes,
          ...buildRowContextPayload(latestRequestRow || row)
        });
        if (!result.ok) {
          setNotification({ type: "error", message: result.error || "Could not update that time-off request." });
          return false;
        }
        const refreshedRows = await refreshLogs({ showSpinner: false });
        if (refreshedRows) {
          setNotification({ type: "success", message: successMessage });
        } else {
          setNotification({ type: "info", message: `${successMessage} The latest schedule rows could not be reloaded automatically.` });
        }
        setSelectedAdminCell(null);
        return true;
      } catch (err) {
        console.error("Admin time-off action failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted the time-off update." });
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
      setMessages((prev) => {
        let didReplace = false;
        const nextMessages = prev.map((message) => {
          if (message?.rowNumber !== updatedMessageRow.rowNumber) return message;
          didReplace = true;
          return {
            ...message,
            ...updatedMessageRow,
            reactions: sanitizeMessageReactions(updatedMessageRow.reactions)
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
        setNotification({ type: "error", message: "Enter a note before sending it." });
        return false;
      }
      if (messageText.length > MESSAGE_MAX_LENGTH) {
        setNotification({ type: "error", message: `Notes must be ${MESSAGE_MAX_LENGTH} characters or less.` });
        return false;
      }
      lastActivityRef.current = Date.now();
      setIsSubmittingMessage(true);
      try {
        const timestamp = buildActionTimestamp();
        const result = await sendToSheet({
          action: "POST_MESSAGE",
          editorName: activeUser.name,
          editorRole: activeUser.role || (adminUser ? "admin" : "employee"),
          message: messageText,
          submittedAt: timestamp.isoTimestamp,
          timezone: timestamp.timezone,
          timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes
        });
        if (!result.ok) {
          const messageText2 = String(result.error || "").trim();
          const isUnsupportedMessageAction = /Unsupported action:\s*POST_MESSAGE/i.test(messageText2);
          setNotification({
            type: "error",
            message: isUnsupportedMessageAction ? "The live Apps Script deployment is still the older version and does not support messages yet. Redeploy the latest web app version, then try again." : result.error || "Could not post that note."
          });
          return false;
        }
        const refreshedMessages = await refreshMessages({ showSpinner: false });
        if (refreshedMessages) {
          setNotification({ type: "success", message: "Note posted to the shared board." });
        } else {
          setNotification({ type: "info", message: "The note was posted, but the latest board could not be refreshed automatically." });
        }
        setMessageDraft("");
        return true;
      } catch (err) {
        console.error("Message post failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted the note." });
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
          editorRole: activeUser.role || (adminUser ? "admin" : "employee"),
          reaction: normalizedReaction,
          submittedAt: timestamp.isoTimestamp,
          timezone: timestamp.timezone,
          timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes
        });
        if (!result.ok) {
          const reactionErrorText = String(result.error || "").trim();
          const isUnsupportedReactionAction = /Unsupported action:\s*TOGGLE_MESSAGE_REACTION/i.test(reactionErrorText);
          setNotification({
            type: "error",
            message: isUnsupportedReactionAction ? "The live Apps Script deployment does not support message reactions yet. Redeploy the latest web app version, then try again." : result.error || "Could not save that reaction."
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
          setNotification({ type: "info", message: "The reaction was saved, but the latest board could not be refreshed automatically." });
        }
        return true;
      } catch (err) {
        console.error("Message reaction failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted the reaction." });
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
          quantity
        },
        `${quantity} ${quantity === 1 ? "item" : "items"} started for ${row.sku}.`
      );
    };
    const handleInventoryFinish = async (row, quantity) => {
      return submitInventoryAction(
        {
          action: "INVENTORY_FINISH",
          rowNumber: row.rowNumber,
          quantity
        },
        `${quantity} ${quantity === 1 ? "item" : "items"} moved to Awaiting Approval for ${row.sku}.`
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
          editorRole: adminUser.role || "admin"
        },
        `${itemLabel} now has ${quantity} more item${quantity === 1 ? "" : "s"} needed.`
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
          editorRole: adminUser.role || "admin"
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
          editorRole: adminUser.role || "admin"
        },
        `${quantity} ${quantity === 1 ? "item was" : "items were"} approved for ${row.sku}.`,
        `${quantity} ${quantity === 1 ? "item was" : "items were"} approved for ${row.sku}, but the inventory board could not be refreshed automatically.`
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
          editorRole: adminUser.role || "admin"
        },
        `${quantity} ${quantity === 1 ? "item was" : "items were"} sent back from Awaiting Approval for ${row.sku}.`
      );
    };
    const handleCreatePenHospitalCase = async (customerName, expectedCount, diagnosis = "", penNames = "") => {
      if (!adminUser) return false;
      return submitPenHospitalAction(
        {
          action: "PEN_HOSPITAL_CREATE_CASE",
          customerName,
          expectedCount,
          diagnosis,
          penNames,
          editorName: adminUser.name,
          editorRole: adminUser.role || "admin"
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
          editorRole: activeUser.role || (adminUser ? "admin" : "employee")
        },
        `${String(caseRow.customerName || "This case").trim() || "This case"} moved to ${nextStatus}.`
      );
    };
    const saveAdminEmployee = async (employee, draft) => {
      if (!adminUser || !employee?.rowNumber || isSubmittingEmployeeAdmin) return false;
      const trimmedName = String(draft?.name || "").trim();
      const trimmedHourlyWage = String(draft?.hourlyWage || "").trim();
      if (!trimmedName) {
        setNotification({ type: "error", message: "Employee name is required." });
        return false;
      }
      if (trimmedHourlyWage && !Number.isFinite(parseCurrencyNumber(trimmedHourlyWage))) {
        setNotification({ type: "error", message: "Hourly wage must be a valid dollar amount." });
        return false;
      }
      setIsSubmittingEmployeeAdmin(true);
      try {
        const result = await sendToSheet({
          action: "ADMIN_UPDATE_EMPLOYEE",
          employeeRowNumber: employee.rowNumber,
          editorName: adminUser.name,
          editorRole: adminUser.role || "admin",
          name: trimmedName,
          jobTitle: String(draft?.jobTitle || "").trim(),
          pin: String(draft?.pin || "").trim(),
          role: String(draft?.role || "employee").trim().toLowerCase(),
          active: Boolean(draft?.active),
          hourlyWage: trimmedHourlyWage,
          phoneNumber: String(draft?.phoneNumber || "").trim()
        });
        if (!result.ok) {
          setNotification({ type: "error", message: result.error || "Could not save the employee details." });
          return false;
        }
        const updatedEmployee = result?.parsed?.employee || null;
        if (updatedEmployee && adminUser?.rowNumber === updatedEmployee.rowNumber) {
          setAdminUser(updatedEmployee);
        }
        const [employeesRefresh, logsRefresh] = await Promise.allSettled([
          refreshEmployees(),
          refreshLogs({ showSpinner: false })
        ]);
        if (employeesRefresh.status === "fulfilled" && logsRefresh.status === "fulfilled") {
          setNotification({ type: "success", message: "Employee details saved." });
        } else {
          setNotification({ type: "info", message: "Employee details were saved, but the latest data could not be fully reloaded." });
        }
        return true;
      } catch (err) {
        console.error("Admin employee save failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted the employee update." });
        return false;
      } finally {
        setIsSubmittingEmployeeAdmin(false);
      }
    };
    const createAdminEmployee = async (draft) => {
      if (!adminUser || isCreatingEmployeeAdmin) return null;
      const trimmedName = String(draft?.name || "").trim();
      const trimmedHourlyWage = String(draft?.hourlyWage || "").trim();
      if (!trimmedName) {
        setNotification({ type: "error", message: "Employee name is required." });
        return null;
      }
      if (trimmedHourlyWage && !Number.isFinite(parseCurrencyNumber(trimmedHourlyWage))) {
        setNotification({ type: "error", message: "Hourly wage must be a valid dollar amount." });
        return null;
      }
      setIsCreatingEmployeeAdmin(true);
      try {
        const result = await sendToSheet({
          action: "ADMIN_CREATE_EMPLOYEE",
          editorName: adminUser.name,
          editorRole: adminUser.role || "admin",
          name: trimmedName,
          jobTitle: String(draft?.jobTitle || "").trim(),
          pin: String(draft?.pin || "").trim(),
          role: String(draft?.role || "employee").trim().toLowerCase(),
          active: Boolean(draft?.active),
          hourlyWage: trimmedHourlyWage,
          phoneNumber: String(draft?.phoneNumber || "").trim()
        });
        if (!result.ok) {
          setNotification({ type: "error", message: result.error || "Could not create the employee." });
          return null;
        }
        const createdEmployee = result?.parsed?.employee || null;
        const refreshedEmployees = await refreshEmployees();
        if (refreshedEmployees) {
          setNotification({ type: "success", message: `Employee created for ${trimmedName}.` });
        } else {
          setNotification({ type: "info", message: "Employee was created, but the latest employee list could not be reloaded automatically." });
        }
        return createdEmployee;
      } catch (err) {
        console.error("Admin employee create failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted employee creation." });
        return null;
      } finally {
        setIsCreatingEmployeeAdmin(false);
      }
    };
    useEffect(() => {
      if (employees.length === 0) return;
      setEmployees((prev) => {
        let changed = false;
        const next = prev.map((emp) => {
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
      setViewMode("PINPAD");
      setEmployeeTimeOffDraft(null);
      clearSessionTimeoutState();
      await refreshSheetData(false);
    };
    const saveAdminWeekSchedules = async () => {
      if (!adminUser || !isAdminRole(adminUser.role) || isSubmittingAdminSchedule) return;
      const stagedDrafts = Object.values(adminScheduleDrafts);
      if (stagedDrafts.length === 0) {
        setNotification({ type: "info", message: "No schedule changes are staged yet." });
        return;
      }
      const invalidDraft = stagedDrafts.find(
        (draft) => !draft.clearSchedule && (!formatTimeField(draft.schedIn, draft.schedInPeriod) || !formatTimeField(draft.schedOut, draft.schedOutPeriod))
      );
      if (invalidDraft) {
        selectAdminCell(invalidDraft.name, invalidDraft.date);
        setNotification({ type: "error", message: `Enter valid scheduled in/out times for ${invalidDraft.name} on ${formatFullDate(invalidDraft.date)}.` });
        return;
      }
      setIsSubmittingAdminSchedule(true);
      try {
        const latestRows = await refreshLogs();
        if (!latestRows) {
          setNotification({ type: "error", message: "Could not refresh the latest schedule rows. Nothing was saved." });
          return;
        }
        const payloadEntries = [];
        for (const draft of stagedDrafts) {
          let latestSourceRow = null;
          if (draft.sourceRow) {
            const sourceKey = buildRowFingerprint(draft.sourceRow);
            latestSourceRow = latestRows.find((row) => buildRowFingerprint(row) === sourceKey) || null;
            if (!latestSourceRow) {
              selectAdminCell(draft.name, draft.date);
              setNotification({ type: "error", message: `The schedule row for ${draft.name} on ${formatFullDate(draft.date)} changed before it could be updated. Reload it and try again.` });
              return;
            }
          } else {
            latestSourceRow = getScheduleRowForEmployeeDate(latestRows, draft.name, draft.date);
          }
          payloadEntries.push({
            name: draft.name,
            date: normalizeDate(draft.date),
            schedIn: draft.clearSchedule ? "" : formatTimeField(draft.schedIn, draft.schedInPeriod),
            schedOut: draft.clearSchedule ? "" : formatTimeField(draft.schedOut, draft.schedOutPeriod),
            scheduleStatus: draft.clearSchedule ? "" : normalizeAdminScheduleStatus(draft.scheduleStatus),
            clearSchedule: Boolean(draft.clearSchedule),
            ...buildRowContextPayload(latestSourceRow)
          });
        }
        const result = await sendToSheet({
          action: "ADMIN_BATCH_UPSERT_SCHEDULES",
          editorName: adminUser.name,
          editorRole: adminUser.role || "admin",
          entries: payloadEntries
        });
        if (!result.ok) {
          setNotification({ type: "error", message: result.error || "Could not save the staged schedules." });
          return;
        }
        const refreshedRows = await refreshLogs();
        const isStructuredSheetSuccess = String(result?.parsed?.status || "").toLowerCase() === "success";
        const refreshConfirmedSchedule = Boolean(refreshedRows) && payloadEntries.every(
          (entry) => entry.clearSchedule ? isExpectedScheduleCellCleared(refreshedRows, entry) : Boolean(getExpectedScheduleRow(refreshedRows, entry))
        );
        if (refreshConfirmedSchedule) {
          setNotification({
            type: "success",
            message: `${payloadEntries.length} schedule change${payloadEntries.length === 1 ? "" : "s"} saved`
          });
          setAdminScheduleDrafts({});
        } else if (isStructuredSheetSuccess && !refreshedRows) {
          setNotification({ type: "info", message: "The server confirmed the weekly save, but the latest sheet rows could not be reloaded automatically yet." });
        } else if (result.isLegacyTextSuccess) {
          setNotification({
            type: "error",
            message: "This weekly schedule save could not be confirmed in the spreadsheet. The live Apps Script deployment is still the older version and needs the updated web-app deployment before batch schedule saves can be verified safely."
          });
        } else {
          setNotification({ type: "error", message: "These weekly schedule changes could not be confirmed in the latest spreadsheet rows." });
        }
      } catch (err) {
        console.error("Admin week schedule save failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted the weekly schedule save." });
      } finally {
        setIsSubmittingAdminSchedule(false);
      }
    };
    const clearAdminWeekSchedules = () => {
      if (isSubmittingAdminSchedule) return;
      const stagedCount = Object.keys(adminScheduleDrafts).length;
      if (stagedCount === 0) {
        setNotification({ type: "info", message: "No staged schedule changes to clear." });
        return;
      }
      setAdminScheduleDrafts({});
      setSelectedAdminCell(null);
      setNotification({
        type: "info",
        message: `Cleared ${stagedCount} staged schedule change${stagedCount === 1 ? "" : "s"}.`
      });
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
      setPinInput((prev) => prev.slice(0, -1));
    };
    const handlePinClear = () => setPinInput("");
    const validatePin = async (inputPin) => {
      const emp = employees.find((e) => e.id === selectedId);
      if (!emp) {
        setNotification({ type: "error", message: "That employee record changed. Please select your name again." });
        handleSelectionCancel();
        return;
      }
      if (inputPin === emp.pin) {
        const isAdminAccount = isAdminRole(emp.role);
        setIsAuthenticated(true);
        setPinInput("");
        setViewMode(isAdminAccount ? "ADMIN" : "TIMESHEET");
        setAdminUser(isAdminAccount ? emp : null);
        setDirectoryMode(isAdminAccount ? "admin" : "employee");
        clearSessionTimeoutState();
        setNotification({
          type: "success",
          message: isAdminAccount ? `Admin Access: ${emp.name}` : `Identity Verified: ${emp.name}`
        });
        await refreshSheetData(false);
      } else {
        setNotification({ type: "error", message: "Incorrect PIN" });
        setPinInput("");
      }
    };
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (viewMode !== "PINPAD" || !selectedId) return;
        if (e.key >= "0" && e.key <= "9") {
          handlePinPress(e.key);
        } else if (e.key === "Backspace") {
          e.preventDefault();
          handlePinBackspace();
        } else if (e.key === "Delete" || e.key === "Escape") {
          e.preventDefault();
          handlePinClear();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [viewMode, selectedId, pinInput, employees]);
    const buildMidnightAutoClockOutAlertState = (employeeName, row, timeValue = MIDNIGHT_AUTO_CLOCK_OUT_TIME) => {
      const closedRow = row ? {
        ...row,
        name: row.name || employeeName || "",
        date: normalizeDate(row.date),
        timeOut: timeValue
      } : null;
      return {
        employeeName,
        rowKey: buildRowFingerprint(closedRow),
        message: buildMidnightAutoClockOutMessage(employeeName, row, { completed: true })
      };
    };
    const handleClockAction = async (actionType) => {
      if (!selectedEmployee || isSubmittingAction) return;
      lastActivityRef.current = Date.now();
      setIsSubmittingAction(true);
      try {
        const latestRows = await refreshLogs();
        if (!latestRows) {
          setNotification({ type: "error", message: "Could not refresh the latest timesheet rows. Punch was not submitted." });
          return;
        }
        const timestamp = buildActionTimestamp();
        let plan = actionType === "CLOCK_IN" ? resolveClockInPlan(latestRows, selectedEmployee.name, timestamp.localDate) : resolveClockOutPlan(latestRows, selectedEmployee.name, timestamp.localDate);
        if (!plan || plan.status !== "ready") {
          setNotification({ type: "error", message: plan?.message || "This punch could not be matched safely." });
          return;
        }
        let workingRows = latestRows;
        let midnightAutoClockOutOccurred = false;
        if (plan.autoClockOut?.row) {
          const autoClockOutRow = plan.autoClockOut.row;
          const autoClockOutTime = plan.autoClockOut.time || MIDNIGHT_AUTO_CLOCK_OUT_TIME;
          const autoClockOutPayload = {
            action: "CLOCK_OUT",
            date: normalizeDate(autoClockOutRow.date),
            time: autoClockOutTime,
            name: selectedEmployee.name,
            submittedAt: timestamp.isoTimestamp,
            timezone: timestamp.timezone,
            timezoneOffsetMinutes: timestamp.timezoneOffsetMinutes,
            resolutionCode: "midnight-auto-clock-out",
            ...buildRowContextPayload(autoClockOutRow),
            ...buildWorkedDurationFields(autoClockOutRow.timeIn || "", autoClockOutTime)
          };
          const autoClockOutResult = await sendToSheet(autoClockOutPayload);
          if (!autoClockOutResult.ok) {
            setNotification({
              type: "error",
              message: autoClockOutResult.error || "The prior shift could not be auto clocked out at midnight."
            });
            return;
          }
          const rowsAfterAutoClockOut = await refreshLogs({ showSpinner: false });
          const closedAutoClockOutRow = rowsAfterAutoClockOut ? rowsAfterAutoClockOut.find(
            (row) => row.name === selectedEmployee.name && normalizeDate(row.date) === normalizeDate(autoClockOutRow.date) && normalizeTimeForComparison(row.timeIn || "") === normalizeTimeForComparison(autoClockOutRow.timeIn || "") && normalizeTimeForComparison(row.timeOut || "") === normalizeTimeForComparison(autoClockOutTime)
          ) || null : null;
          setMidnightAutoClockOutAlert(
            buildMidnightAutoClockOutAlertState(selectedEmployee.name, closedAutoClockOutRow || autoClockOutRow, autoClockOutTime)
          );
          midnightAutoClockOutOccurred = true;
          if (!rowsAfterAutoClockOut) {
            setNotification({
              type: "info",
              message: "The prior shift was auto clocked out at midnight, but the latest rows could not be reloaded yet. Please refresh before punching again."
            });
            return;
          }
          workingRows = rowsAfterAutoClockOut;
          plan = actionType === "CLOCK_IN" ? resolveClockInPlan(workingRows, selectedEmployee.name, timestamp.localDate) : resolveClockOutPlan(workingRows, selectedEmployee.name, timestamp.localDate);
          if (!plan || plan.status !== "ready") {
            setNotification({
              type: "error",
              message: plan?.message || "The prior shift was auto clocked out at midnight, but today's punch still could not be matched safely."
            });
            return;
          }
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
          ...buildRowContextPayload(plan.row)
        };
        if (actionType === "CLOCK_IN") {
          actionPayload.reason = getLateStartNote(plan.row?.schedIn, timestamp.localTime);
        } else {
          Object.assign(actionPayload, buildWorkedDurationFields(plan.row?.timeIn || "", timestamp.localTime));
        }
        const result = await sendToSheet(actionPayload);
        if (!result.ok) {
          setNotification({ type: "error", message: result.error || "Could not save this punch." });
          return;
        }
        const isStructuredSheetSuccess = String(result?.parsed?.status || "").toLowerCase() === "success";
        const localRows = isStructuredSheetSuccess ? applySuccessfulPunchLocally(
          workingRows,
          actionType,
          selectedEmployee.name,
          timestamp,
          plan,
          actionPayload.reason || ""
        ) : null;
        const expectedSavedRow = localRows ? getExpectedActionRow(
          localRows,
          actionType,
          selectedEmployee.name,
          timestamp,
          plan
        ) : null;
        const refreshedRows = await refreshLogs();
        const baseSuccessMessage = actionType === "CLOCK_IN" ? "Clocked In Successfully" : "Clocked Out Successfully";
        const successMessage = midnightAutoClockOutOccurred ? `${baseSuccessMessage}. The prior shift was auto clocked out at midnight.` : baseSuccessMessage;
        const refreshConfirmedPunch = Boolean(
          refreshedRows && expectedSavedRow && getExpectedActionRow(
            refreshedRows,
            actionType,
            selectedEmployee.name,
            timestamp,
            plan
          )
        );
        if (refreshConfirmedPunch) {
          setNotification({ type: actionType === "CLOCK_IN" ? "success" : "info", message: successMessage });
        } else if (isStructuredSheetSuccess && !refreshedRows && localRows) {
          setSheetData(localRows);
          setNotification({
            type: "info",
            message: `${successMessage}. The server confirmed the save, but the latest sheet rows could not be reloaded automatically yet. Please verify the spreadsheet before the employee leaves this screen.`
          });
        } else if (result.isLegacyTextSuccess) {
          setNotification({
            type: "error",
            message: "This punch could not be confirmed in the spreadsheet. The live Apps Script deployment is still returning the older plain-text Success response, so it needs the updated web-app deployment before punches can be verified safely."
          });
        } else {
          setNotification({
            type: "error",
            message: "This punch could not be confirmed in the latest spreadsheet rows. Please review the sheet before the employee leaves this screen."
          });
        }
      } catch (err) {
        console.error("Clock action failed:", err);
        setNotification({ type: "error", message: err?.message || "An unexpected error interrupted this punch." });
      } finally {
        setIsSubmittingAction(false);
      }
    };
    const loadEditRow = (row) => {
      const parsedIn = parseTimeField(row.timeIn);
      const parsedOut = parseTimeField(row.timeOut || "");
      setEditTarget(row);
      setReasonValidationTriggered(false);
      setEditForm({
        timeIn: parsedIn.time,
        timeInPeriod: parsedIn.period,
        timeOut: parsedOut.time,
        timeOutPeriod: parsedOut.period,
        oldReason: row.reason || "",
        newReason: ""
      });
    };
    const startEdit = (row) => {
      if (isEntryLocked(row)) {
        setNotification({ type: "error", message: "This entry is locked and cannot be edited." });
        return;
      }
      loadEditRow(row);
      setViewMode("EDIT");
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
        setNotification({ type: "error", message: "This entry is locked and cannot be edited." });
        setViewMode("TIMESHEET");
        return;
      }
      if (!editForm.newReason.trim()) {
        setReasonValidationTriggered(true);
        setNotification({ type: "error", message: "A reason for editing is required." });
        return;
      }
      setReasonValidationTriggered(false);
      const updatedTimeIn = formatTimeField(editForm.timeIn, editForm.timeInPeriod);
      const updatedTimeOut = editForm.timeOut ? formatTimeField(editForm.timeOut, editForm.timeOutPeriod) : "";
      if (!updatedTimeIn) {
        setNotification({ type: "error", message: "Enter a valid Time In (h:mm + AM/PM)." });
        return;
      }
      if (editForm.timeOut && !updatedTimeOut) {
        setNotification({ type: "error", message: "Enter a valid Time Out (h:mm + AM/PM)." });
        return;
      }
      const history = parseReasonCell(editForm.oldReason).map((entry) => ({
        t: entry.rawTimestamp || entry.timestamp || "",
        by: entry.editor || "",
        n: entry.note || ""
      })).filter((entry) => entry.n.trim() !== "");
      history.push({
        t: (/* @__PURE__ */ new Date()).toISOString(),
        by: selectedEmployee?.name || "",
        n: editForm.newReason.trim()
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
        editorName: selectedEmployee?.name || "",
        editorRole: selectedEmployee?.role || "employee",
        reason: combinedReason,
        submittedAt: editTimestamp.isoTimestamp,
        timezone: editTimestamp.timezone,
        timezoneOffsetMinutes: editTimestamp.timezoneOffsetMinutes,
        ...buildRowContextPayload(editTarget),
        ...durationFields
      };
      const shouldClearMidnightAutoClockOutAlert = Boolean(
        midnightAutoClockOutAlert && midnightAutoClockOutAlert.employeeName === editTarget.name && midnightAutoClockOutAlert.rowKey && buildRowFingerprint(editTarget) === midnightAutoClockOutAlert.rowKey
      );
      setIsSubmittingAction(true);
      try {
        const result = await sendToSheet(payload);
        if (!result.ok) {
          setNotification({ type: "error", message: result.error || "Could not update the timesheet." });
          return;
        }
        if (shouldClearMidnightAutoClockOutAlert) {
          setMidnightAutoClockOutAlert(null);
        }
        const refreshedRows = await refreshLogs();
        if (refreshedRows) {
          setNotification({ type: "success", message: "Timesheet Updated" });
        } else {
          setNotification({ type: "info", message: "Timesheet updated, but the latest rows could not be reloaded automatically." });
        }
        setViewMode("TIMESHEET");
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
        if (rawText && String(rawText).trim().toLowerCase().startsWith("error")) {
          throw new Error(String(rawText).trim());
        }
        if (rawText) {
          try {
            const parsed = JSON.parse(rawText);
            if (String(parsed?.status || "").toLowerCase() === "error") {
              throw new Error(parsed.message || "The sheet reported an error.");
            }
            return { ok: true, parsed, rawText };
          } catch (parseError) {
            if (!/Unexpected token/i.test(parseError.message || "")) {
              throw parseError;
            }
          }
        }
        return {
          ok: true,
          rawText,
          isLegacyTextSuccess: String(rawText || "").trim() === "Success"
        };
      } catch (err) {
        console.error("Network Error:", err);
        return { ok: false, error: err?.message || "Could not reach the timesheet service." };
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen p-2 md:p-8 flex flex-col items-center" }, /* @__PURE__ */ React.createElement("div", { className: "page-width flex justify-between items-center mb-4 md:mb-8 brutal-card panel-shell-padding" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 md:gap-4 overflow-hidden" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: openAdminDirectory,
        className: `brutal-btn flex items-center justify-center shrink-0 overflow-hidden ${settings.logoUrl ? "bg-white p-0.5 md:p-1" : "bg-[#38bdf8] w-8 h-8 md:w-12 md:h-12 text-sm md:text-xl"}`,
        title: "Open admin menu",
        "aria-label": "Open admin menu"
      },
      settings.logoUrl ? /* @__PURE__ */ React.createElement("img", { src: settings.logoUrl, alt: "Logo", className: "h-8 md:h-12 w-auto object-contain drop-shadow-md shrink-0" }) : /* @__PURE__ */ React.createElement("span", { className: "leading-none", "aria-hidden": "true" }, "\u{1F428}")
    ), /* @__PURE__ */ React.createElement("div", { className: "w-[170px] sm:w-[220px] md:w-[360px] lg:w-[460px] min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("h1", { className: "text-lg md:text-3xl font-bold font-poppins text-[#060606] truncate min-h-[1.75rem] md:min-h-[2.25rem]" }, settings.companyName || "\xA0")), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 font-bold text-[10px] md:text-base truncate" }, currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center shrink-0 ml-2" }, /* @__PURE__ */ React.createElement("div", { className: "text-xl md:text-5xl font-bold font-poppins text-[#060606] tracking-tighter" }, currentTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })))), /* @__PURE__ */ React.createElement("div", { className: "page-width app-shell" }, /* @__PURE__ */ React.createElement("div", { className: "left-panel" }, /* @__PURE__ */ React.createElement("div", { className: `brutal-card left-panel-card left-panel-card-padding transition-all duration-300 ${!selectedId ? "block" : isAuthenticated ? "hidden" : "hidden lg:block"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 md:mb-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-lg md:text-xl font-bold font-poppins text-[#060606] flex items-center gap-2 md:gap-3" }, /* @__PURE__ */ React.createElement("i", { className: `fas ${directoryMode === "admin" ? "fa-user-shield text-[#38bdf8]" : "fa-users text-[#f43f5e]"} text-xl md:text-2xl` }), directoryMode === "admin" ? "Admin Menu" : "Select Name")), directoryMode === "admin" && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: returnToEmployeeDirectory,
        className: "brutal-btn bg-white px-3 py-2 text-xs md:text-sm text-center w-full sm:w-auto"
      },
      "Back to Staff"
    )), isLoadingEmployees ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center h-32 md:h-48 text-[#060606] font-bold gap-3" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-circle-notch spinner text-3xl md:text-4xl text-[#38bdf8]" }), /* @__PURE__ */ React.createElement("p", { className: "text-sm md:text-base" }, "Loading team...")) : fetchError ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center h-32 md:h-48 text-[#f43f5e] gap-2 md:gap-3 text-center" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-exclamation-circle text-3xl md:text-4xl" }), /* @__PURE__ */ React.createElement("p", { className: "font-bold text-xs md:text-base" }, fetchError), /* @__PURE__ */ React.createElement("button", { onClick: () => window.location.reload(), className: "brutal-btn bg-white py-1 md:py-2 px-3 md:px-4 mt-2 text-sm md:text-base" }, "Retry")) : directoryEmployees.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400" }, directoryMode === "admin" ? "No admin-capable accounts are active in the Employees sheet yet." : "No active employee accounts were found.") : /* @__PURE__ */ React.createElement("div", { className: "standard-two-up-grid" }, directoryEmployees.map((emp) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: emp.id,
        onClick: () => handleEmployeeSelect(emp.id),
        className: `
                                                        brutal-btn standard-unit-button flex flex-col items-center justify-center gap-1 relative
                                                        ${selectedId === emp.id ? "bg-[#38bdf8]" : emp.isClockedIn ? "bg-[#a7f3d0]" : "bg-white hover:bg-gray-50"}
                                                    `
      },
      emp.isClockedIn && /* @__PURE__ */ React.createElement("div", { className: "absolute top-1.5 md:top-2 right-1.5 md:right-2 flex items-center gap-1" }, /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#10b981] border border-black animate-pulse" })),
      /* @__PURE__ */ React.createElement("span", { className: "font-bold font-poppins text-[#060606] text-center text-sm md:text-base lg:text-lg leading-tight" }, emp.name),
      /* @__PURE__ */ React.createElement("span", { className: "text-[9px] md:text-[10px] lg:text-xs font-bold opacity-70 text-[#060606]" }, directoryMode === "admin" ? String(emp.role || "admin").toUpperCase() : emp.department)
    )))), isAuthenticated && !adminUser && /* @__PURE__ */ React.createElement("div", { className: "brutal-card left-panel-card left-panel-card-padding animate-fade-in bg-white" }, /* @__PURE__ */ React.createElement("h2", { className: "text-lg md:text-xl font-bold font-poppins text-[#060606] mb-5 truncate" }, "Hello, ", selectedEmployee?.name, "!"), /* @__PURE__ */ React.createElement("div", { className: "standard-two-up-grid" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleOpenEmployeeTimesheet,
        className: `brutal-btn standard-unit-button stacked-action-button text-[#060606] ${["TIMESHEET", "EDIT"].includes(viewMode) ? "bg-[#38bdf8] hover:bg-[#0ea5e9]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-clock text-[#060606]" }),
      /* @__PURE__ */ React.createElement("span", null, "Timesheet")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleOpenEmployeeSchedule,
        className: `brutal-btn standard-unit-button stacked-action-button text-[#060606] ${viewMode === "SCHEDULE" ? "bg-[#38bdf8] hover:bg-[#0ea5e9]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-calendar-day text-[#060606]" }),
      /* @__PURE__ */ React.createElement("span", null, "Schedule")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleOpenEmployeeInventory,
        className: `brutal-btn standard-unit-button stacked-action-button text-[#060606] ${viewMode === "INVENTORY" ? "bg-[#fef3c7] hover:bg-[#fde68a]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-boxes-stacked text-[#f97316]" }),
      /* @__PURE__ */ React.createElement("span", null, "Inventory")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleOpenEmployeePenHospital,
        className: `brutal-btn standard-unit-button stacked-action-button text-[#060606] ${viewMode === "PEN_HOSPITAL" ? "bg-[#ccfbf1] hover:bg-[#99f6e4]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-suitcase-medical text-[#0f766e]" }),
      /* @__PURE__ */ React.createElement("span", null, "Pen Hospital")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleOpenEmployeeMessages,
        className: `brutal-btn standard-unit-button stacked-action-button text-[#060606] ${viewMode === "MESSAGES" ? "bg-[#f9a8d4] hover:bg-[#f472b6]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-comments text-[#db2777]" }),
      /* @__PURE__ */ React.createElement("span", null, "Messages")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleLogout,
        className: "brutal-btn standard-unit-button stacked-action-button bg-white hover:bg-gray-50 text-[#060606]"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-user-lock text-[#f43f5e]" }),
      /* @__PURE__ */ React.createElement("span", null, "Sign Out")
    )), renderBrowserAlertControl()), isAuthenticated && adminUser && /* @__PURE__ */ React.createElement("div", { className: "brutal-card left-panel-card left-panel-card-padding animate-fade-in bg-white" }, /* @__PURE__ */ React.createElement("h2", { className: "text-lg md:text-xl font-bold font-poppins text-[#060606] mb-5 truncate" }, "Hi, ", adminUser.name), /* @__PURE__ */ React.createElement("div", { className: "standard-two-up-grid" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setViewMode("ADMIN"),
        className: `brutal-btn standard-unit-button admin-action-button text-[#060606] ${viewMode === "ADMIN" ? "bg-[#38bdf8] hover:bg-[#0ea5e9]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-calendar-week" }),
      /* @__PURE__ */ React.createElement("span", null, "Schedule")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleOpenAdminInventory,
        className: `brutal-btn standard-unit-button admin-action-button text-[#060606] ${viewMode === "ADMIN_INVENTORY" ? "bg-[#fef3c7] hover:bg-[#fde68a]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-boxes-stacked text-[#f97316]" }),
      /* @__PURE__ */ React.createElement("span", null, "Inventory")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleOpenAdminPenHospital,
        className: `brutal-btn standard-unit-button admin-action-button text-[#060606] ${viewMode === "ADMIN_PEN_HOSPITAL" ? "bg-[#ccfbf1] hover:bg-[#99f6e4]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-suitcase-medical text-[#0f766e]" }),
      /* @__PURE__ */ React.createElement("span", null, "Pen Hospital")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleOpenAdminPayroll,
        className: `brutal-btn standard-unit-button admin-action-button text-[#060606] ${viewMode === "ADMIN_PAYROLL" ? "bg-[#bbf7d0] hover:bg-[#86efac]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-file-invoice-dollar text-[#16a34a]" }),
      /* @__PURE__ */ React.createElement("span", null, "Payroll")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleOpenAdminEmployees,
        className: `brutal-btn standard-unit-button admin-action-button text-[#060606] ${viewMode === "ADMIN_EMPLOYEES" ? "bg-[#ddd6fe] hover:bg-[#c4b5fd]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-users-gear text-[#7c3aed]" }),
      /* @__PURE__ */ React.createElement("span", null, "Employee Admin")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleOpenAdminMessages,
        className: `brutal-btn standard-unit-button admin-action-button text-[#060606] ${viewMode === "ADMIN_MESSAGES" ? "bg-[#f9a8d4] hover:bg-[#f472b6]" : "bg-white hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-comments text-[#db2777]" }),
      /* @__PURE__ */ React.createElement("span", null, "Messages")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleLogout,
        className: "brutal-btn standard-unit-button admin-action-button bg-white hover:bg-gray-50 text-[#060606]"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-user-lock text-[#f43f5e]" }),
      /* @__PURE__ */ React.createElement("span", null, "Sign Out")
    )), renderBrowserAlertControl())), /* @__PURE__ */ React.createElement("div", { className: `right-panel transition-all duration-300 ${!selectedId && directoryMode === "admin" && !isAdminWorkspaceOpen ? "hidden lg:block" : "block"}` }, /* @__PURE__ */ React.createElement("div", { className: `brutal-card ${isAdminWorkspaceOpen ? "min-h-[520px] lg:h-[calc(100vh-220px)] lg:max-h-[860px]" : "min-h-[400px] lg:h-[calc(100vh-220px)] lg:max-h-[800px]"} mb-4 md:mb-8 lg:sticky lg:top-8 flex flex-col relative overflow-hidden ${viewMode === "EDIT" ? "p-0" : "panel-shell-padding"}` }, showTimeoutWarning && /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" }, /* @__PURE__ */ React.createElement("div", { className: "brutal-card p-6 flex flex-col items-center bg-white shadow-[6px_6px_0px_0px_#000000] max-w-sm w-full mx-auto" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-stopwatch text-4xl text-[#38bdf8] mb-4" }), /* @__PURE__ */ React.createElement("h3", { className: "text-xl md:text-2xl font-bold font-poppins text-[#060606] mb-2 text-center" }, "Need more time?"), /* @__PURE__ */ React.createElement("p", { className: "text-[#060606] font-bold mb-6 text-center text-sm md:text-base" }, "Session expires in ", /* @__PURE__ */ React.createElement("span", { className: "text-[#f43f5e] text-xl ml-1" }, timeoutCountdownSeconds), "s"), /* @__PURE__ */ React.createElement("p", { className: "card-meta text-center mb-4" }, hasAcknowledgedTimeoutWarning ? `Saying yes keeps you signed in and sets the next check to ${timeoutResetLabel} from now.` : `The first check stays short. After you confirm once, the next check will be ${timeoutResetLabel} later.`), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: acknowledgeTimeoutWarning,
        className: "brutal-btn bg-[#4ade80] hover:bg-[#22c55e] py-3 px-8 text-lg w-full flex items-center justify-center gap-2"
      },
      /* @__PURE__ */ React.createElement("i", { className: "fas fa-check" }),
      " Yes, I'm still here"
    ))), !selectedId ? directoryMode === "admin" ? /* @__PURE__ */ React.createElement("div", { className: "h-full flex flex-col items-center justify-center text-gray-400 animate-fade-in" }, /* @__PURE__ */ React.createElement("i", { className: "fas fa-user-shield text-4xl md:text-6xl mb-4 md:mb-6 opacity-30 text-[#060606]" }), /* @__PURE__ */ React.createElement("p", { className: "font-bold font-poppins text-lg md:text-2xl text-[#060606] opacity-30" }, "Select an admin account to continue")) : /* @__PURE__ */ React.createElement(PublicOverviewPanel, { sheetData, inventoryRows, penHospitalCases, messages }) : /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-h-0 overflow-hidden" }, viewMode === "PINPAD" && /* @__PURE__ */ React.createElement(PinPad, { pinInput, handlePinPress, handlePinBackspace, handlePinClear, selectedEmployee: selectedUser, onCancel: handleSelectionCancel }), viewMode === "TIMESHEET" && /* @__PURE__ */ React.createElement(
      PersonalDashboard,
      {
        personalData,
        startEdit,
        isFetchingLogs,
        actionAlertPlan,
        onClockAction: handleClockAction,
        canClockIn,
        canClockOut,
        isSubmittingAction,
        roleLabel: ""
      }
    ), viewMode === "SCHEDULE" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      PublishedSchedulePanel,
      {
        sheetData,
        eyebrow: "",
        title: "Schedule",
        highlightName: selectedEmployee?.name || "",
        allowTimeOffRequests: Boolean(selectedEmployee),
        onSelectDate: openEmployeeTimeOffRequest,
        isSubmittingTimeOff
      }
    ), /* @__PURE__ */ React.createElement(
      EmployeeTimeOffModal,
      {
        employeeName: selectedEmployee?.name || "",
        draft: employeeTimeOffDraft,
        setDraft: setEmployeeTimeOffDraft,
        existingRow: activeEmployeeTimeOffRow,
        onClose: closeEmployeeTimeOffRequest,
        onSubmit: submitEmployeeTimeOffRequest,
        isSubmitting: isSubmittingTimeOff
      }
    )), viewMode === "INVENTORY" && /* @__PURE__ */ React.createElement(
      EmployeeInventoryPanel,
      {
        inventoryRows,
        isFetchingInventory,
        isSubmittingInventory,
        onRefresh: () => refreshInventory({ showSpinner: true }),
        onStart: handleInventoryStart,
        onFinish: handleInventoryFinish,
        onMessage: setNotification
      }
    ), viewMode === "PEN_HOSPITAL" && /* @__PURE__ */ React.createElement(
      EmployeePenHospitalPanel,
      {
        penHospitalCases,
        currentUser: activeSessionUser,
        isFetchingPenHospital,
        isSubmittingPenHospital,
        onRefresh: () => refreshPenHospital({ showSpinner: true }),
        onUpdateStatus: handleUpdatePenHospitalStatus
      }
    ), viewMode === "MESSAGES" && /* @__PURE__ */ React.createElement(
      MessageBoardPanel,
      {
        messages,
        title: "Messages",
        eyebrow: "",
        subtitle: "Leave updates about time off, inventory, supplies, or anything else the admin team should see.",
        viewerName: activeMessageViewer?.name || "",
        viewerRole: activeMessageViewer?.role || "",
        draft: messageDraft,
        onDraftChange: setMessageDraft,
        onSend: submitMessage,
        onRefresh: () => refreshMessages({ showSpinner: true }),
        onReact: submitMessageReaction,
        canCompose: Boolean(activeMessageViewer),
        isFetching: isFetchingMessages,
        isSubmitting: isSubmittingMessage,
        reactingRowNumber: reactingMessageRowNumber
      }
    ), viewMode === "EDIT" && /* @__PURE__ */ React.createElement(EditForm, { editTarget, editForm, setEditForm, saveEdit, reasonValidationTriggered, onPrev: handleEditPrev, onNext: handleEditNext, canPrev: canEditPrev, canNext: canEditNext, onClose: () => {
      setReasonValidationTriggered(false);
      setViewMode("TIMESHEET");
    }, isSubmitting: isSubmittingAction }), viewMode === "ADMIN" && /* @__PURE__ */ React.createElement(
      AdminScheduleWorkspace,
      {
        adminUser,
        employees,
        sheetData,
        weekStart: adminWeekStart,
        onPrevWeek: () => setAdminWeekStart((prev) => {
          const next = new Date(prev);
          next.setDate(next.getDate() - 7);
          return next;
        }),
        onNextWeek: () => setAdminWeekStart((prev) => {
          const next = new Date(prev);
          next.setDate(next.getDate() + 7);
          return next;
        }),
        onLoadSavedWeek: loadSavedWeekIntoAdminSchedule,
        selectedCell: selectedAdminCell,
        onSelectCell: selectAdminCell,
        onCloseEditor: () => setSelectedAdminCell(null),
        getCellDraft: getAdminScheduleDraft,
        updateCellDraft: updateAdminScheduleDraft,
        applyTemplateToCell: applyTemplateToAdminSchedule,
        shiftTemplates: settings.shiftTemplates,
        templateName: adminTemplateName,
        onTemplateNameChange: setAdminTemplateName,
        onSaveCurrentTemplate: saveSelectedShiftAsTemplate,
        savedWeekOptions,
        saveWeekSchedules: saveAdminWeekSchedules,
        clearWeekSchedules: clearAdminWeekSchedules,
        dirtyCount: stagedScheduleChangeCount,
        isRefreshing: isFetchingLogs,
        isSubmitting: isSubmittingAdminSchedule,
        isSubmittingTimeOff,
        isSavingTemplates: isSavingShiftTemplates,
        onApproveTimeOff: handleApproveTimeOff,
        onClearTimeOff: handleClearTimeOff
      }
    ), viewMode === "ADMIN_INVENTORY" && /* @__PURE__ */ React.createElement(
      AdminInventoryWorkspace,
      {
        adminUser,
        inventoryRows,
        isFetchingInventory,
        isSubmittingInventory,
        onRefresh: () => refreshInventory({ showSpinner: true }),
        onAddNeed: handleInventoryAddNeed,
        onAdjustNeed: handleInventoryAdjustNeed,
        onApprove: handleInventoryApprove,
        onReject: handleInventoryRejectAwaiting,
        onOpenScheduler: () => setViewMode("ADMIN"),
        onMessage: setNotification
      }
    ), viewMode === "ADMIN_PEN_HOSPITAL" && /* @__PURE__ */ React.createElement(
      AdminPenHospitalWorkspace,
      {
        adminUser,
        penHospitalCases,
        isFetchingPenHospital,
        isSubmittingPenHospital,
        onRefresh: () => refreshPenHospital({ showSpinner: true }),
        onCreateCase: handleCreatePenHospitalCase,
        onUpdateStatus: handleUpdatePenHospitalStatus,
        onMessage: setNotification
      }
    ), viewMode === "ADMIN_MESSAGES" && /* @__PURE__ */ React.createElement(
      MessageBoardPanel,
      {
        messages,
        title: "Team Messages",
        eyebrow: formatRoleLabel(activeMessageViewer?.role || adminUser?.role, "Admin"),
        subtitle: "Review employee notes and reply in the same shared chat thread.",
        viewerName: activeMessageViewer?.name || "",
        viewerRole: activeMessageViewer?.role || "",
        draft: messageDraft,
        onDraftChange: setMessageDraft,
        onSend: submitMessage,
        onRefresh: () => refreshMessages({ showSpinner: true }),
        onReact: submitMessageReaction,
        canCompose: Boolean(activeMessageViewer),
        isFetching: isFetchingMessages,
        isSubmitting: isSubmittingMessage,
        reactingRowNumber: reactingMessageRowNumber
      }
    ), viewMode === "ADMIN_PAYROLL" && /* @__PURE__ */ React.createElement(
      AdminPayrollWorkspace,
      {
        adminUser,
        employees,
        sheetData,
        isRefreshing: isFetchingLogs,
        onRefresh: () => refreshLogs({ showSpinner: true })
      }
    ), viewMode === "ADMIN_EMPLOYEES" && /* @__PURE__ */ React.createElement(
      AdminEmployeeWorkspace,
      {
        adminUser,
        employees,
        isSubmitting: isSubmittingEmployeeAdmin,
        isCreating: isCreatingEmployeeAdmin,
        onSave: saveAdminEmployee,
        onCreate: createAdminEmployee
      }
    )), notification && /* @__PURE__ */ React.createElement("div", { className: `
                                        absolute bottom-6 md:bottom-10 left-0 right-0 mx-auto w-max max-w-[90%] px-6 py-3 md:px-8 md:py-4 rounded-xl border-3 border-black shadow-[6px_6px_0px_0px_#000000] text-[#060606] font-bold font-poppins text-sm md:text-lg flex items-center gap-3 animate-fade-in z-[60]
                                        ${notification.type === "success" ? "bg-[#a7f3d0]" : notification.type === "error" ? "bg-[#fecdd3]" : "bg-[#bae6fd]"}
                                    ` }, /* @__PURE__ */ React.createElement("i", { className: `fas ${notification.type === "success" ? "fa-check-circle text-[#059669]" : notification.type === "error" ? "fa-exclamation-triangle text-[#e11d48]" : "fa-info-circle text-[#38bdf8]"}` }), notification.message)))));
  }
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(/* @__PURE__ */ React.createElement(App, null));
})();
