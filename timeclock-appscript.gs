// --- CONFIGURATION ---
var EMPLOYEES_SHEET_NAME = "Employees";
var LOGS_SHEET_NAME = "Sheet1";
var SETTINGS_SHEET_NAME = "Settings";

/*
 * COLUMN MAPPING (Sheet1):
 * A: Day
 * B: Name
 * C: Scheduled In
 * D: Scheduled Out
 * E: Total Scheduled Hours
 * F: Time In
 * G: Time Out
 * H: Total Hours
 * I: Notes / Edits
 * J: Payroll Status
 * K: Schedule Status
 * L: Decimal Hours
 */
var LOG_COL = {
  DAY: 1,
  NAME: 2,
  SCHED_IN: 3,
  SCHED_OUT: 4,
  TOTAL_SCHEDULED: 5,
  TIME_IN: 6,
  TIME_OUT: 7,
  TOTAL_HOURS: 8,
  NOTES: 9,
  PAYROLL_STATUS: 10,
  SCHEDULE_STATUS: 11,
  DECIMAL_HOURS: 12
};

function doGet(e) {
  var type = (e && e.parameter && e.parameter.type) || "employees";

  if (type === "settings") {
    return getSettings_();
  }

  if (type === "logs") {
    return getLogs_();
  }

  return getEmployees_();
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = false;

  try {
    hasLock = lock.tryLock(10000);
    if (!hasLock) {
      throw new Error("Could not acquire the timesheet lock. Please try again.");
    }

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Missing request body.");
    }

    var data = JSON.parse(e.postData.contents);
    var sheet = getLogsSheet_();

    if (data.action === "CLOCK_IN") {
      return handleClockIn_(sheet, data);
    }

    if (data.action === "CLOCK_OUT") {
      return handleClockOut_(sheet, data);
    }

    if (data.action === "EDIT") {
      return handleEdit_(sheet, data);
    }

    throw new Error("Unsupported action: " + data.action);
  } catch (err) {
    return jsonResponse_({
      status: "error",
      message: err && err.message ? err.message : String(err)
    });
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function getSettings_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET_NAME);
  var settings = {};

  if (sheet) {
    var data = sheet.getDataRange().getDisplayValues();
    if (data.length >= 2) {
      settings = {
        companyName: data[1][0],
        logoUrl: data[1][1],
        themeColor: data[1][2]
      };
    }
  }

  return jsonResponse_(settings);
}

function getLogs_() {
  var sheet = getLogsSheet_();
  var lastRow = sheet.getLastRow();
  var lastColumn = Math.max(sheet.getLastColumn(), LOG_COL.DECIMAL_HOURS);
  var logs = [];

  if (lastRow < 2) {
    return jsonResponse_(logs);
  }

  var data = sheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();

  for (var i = 1; i < data.length; i++) {
    if (!data[i][LOG_COL.NAME - 1]) {
      continue;
    }

    logs.push({
      date: data[i][LOG_COL.DAY - 1],
      name: data[i][LOG_COL.NAME - 1],
      schedIn: data[i][LOG_COL.SCHED_IN - 1],
      schedOut: data[i][LOG_COL.SCHED_OUT - 1],
      timeIn: data[i][LOG_COL.TIME_IN - 1],
      timeOut: data[i][LOG_COL.TIME_OUT - 1],
      totalHours: data[i][LOG_COL.TOTAL_HOURS - 1],
      reason: data[i][LOG_COL.NOTES - 1],
      payrollStatus: data[i][LOG_COL.PAYROLL_STATUS - 1],
      scheduleStatus: data[i][LOG_COL.SCHEDULE_STATUS - 1],
      decimalHours: data[i][LOG_COL.DECIMAL_HOURS - 1]
    });
  }

  return jsonResponse_(logs);
}

function getEmployees_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EMPLOYEES_SHEET_NAME);
  if (!sheet) {
    return jsonResponse_({ error: "No Employees Sheet" });
  }

  var data = sheet.getDataRange().getDisplayValues();
  var employees = [];

  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) {
      continue;
    }

    var roleVal = data[i][3] ? data[i][3].toString().toLowerCase() : "employee";
    var activeVal = data[i][4] ? data[i][4].toString().toUpperCase() : "TRUE";

    if (activeVal === "TRUE") {
      employees.push({
        id: i,
        name: data[i][0],
        department: data[i][1] || "General",
        pin: data[i][2] || "0000",
        role: roleVal
      });
    }
  }

  return jsonResponse_(employees);
}

function handleClockIn_(sheet, data) {
  validateRequiredFields_(data, ["name", "date", "time"]);

  var records = getLogRecords_(sheet);
  var targetRow = resolveClockInRow_(records, data);
  var note = data.reason ? String(data.reason) : "";

  if (targetRow) {
    if (hasValue_(targetRow.timeIn)) {
      throw new Error("The selected row already has a clock-in time. Please refresh before trying again.");
    }
    if (hasValue_(targetRow.timeOut)) {
      throw new Error("The selected row already has a clock-out time. Please refresh before trying again.");
    }

    sheet.getRange(targetRow.rowNumber, LOG_COL.TIME_IN).setValue(data.time);
    if (note) {
      sheet.getRange(targetRow.rowNumber, LOG_COL.NOTES).setValue(note);
    }

    return jsonResponse_({
      status: "success",
      action: "CLOCK_IN",
      rowNumber: targetRow.rowNumber,
      mode: "updated-existing-row"
    });
  }

  var nextRow = Math.max(sheet.getLastRow() + 1, 2);
  sheet.getRange(nextRow, LOG_COL.DAY).setValue(data.date);
  sheet.getRange(nextRow, LOG_COL.NAME).setValue(data.name);
  sheet.getRange(nextRow, LOG_COL.TIME_IN).setValue(data.time);
  sheet.getRange(nextRow, LOG_COL.PAYROLL_STATUS).setValue("Open");
  if (note) {
    sheet.getRange(nextRow, LOG_COL.NOTES).setValue(note);
  }

  return jsonResponse_({
    status: "success",
    action: "CLOCK_IN",
    rowNumber: nextRow,
    mode: "appended-row"
  });
}

function handleClockOut_(sheet, data) {
  validateRequiredFields_(data, ["name", "date", "time"]);

  var records = getLogRecords_(sheet);
  var targetRow = resolveClockOutRow_(records, data);
  if (!targetRow) {
    throw new Error("No matching open shift was found for this clock-out.");
  }
  if (!hasValue_(targetRow.timeIn)) {
    throw new Error("Cannot clock out a row that does not have a clock-in time.");
  }
  if (hasValue_(targetRow.timeOut)) {
    throw new Error("This shift already has a clock-out time. Please refresh before trying again.");
  }

  sheet.getRange(targetRow.rowNumber, LOG_COL.TIME_OUT).setValue(data.time);
  writeDurationValues_(sheet, targetRow.rowNumber, targetRow.timeIn, data.time);

  return jsonResponse_({
    status: "success",
    action: "CLOCK_OUT",
    rowNumber: targetRow.rowNumber
  });
}

function handleEdit_(sheet, data) {
  validateRequiredFields_(data, ["name", "date", "editorName", "editorRole"]);

  var editorName = String(data.editorName || "");
  var editorRole = String(data.editorRole || "employee").toLowerCase();
  var targetName = String(data.name || "");

  if (editorRole === "employee" && editorName !== targetName) {
    throw new Error("Unauthorized. Employees can only edit their own records.");
  }

  var records = getLogRecords_(sheet);
  var targetRow = resolveEditRow_(records, data);
  if (!targetRow) {
    throw new Error("The row being edited could not be found. Please reload the timesheet and try again.");
  }

  sheet.getRange(targetRow.rowNumber, LOG_COL.TIME_IN).setValue(data.newTimeIn || "");
  sheet.getRange(targetRow.rowNumber, LOG_COL.TIME_OUT).setValue(data.newTimeOut || "");
  sheet.getRange(targetRow.rowNumber, LOG_COL.NOTES).setValue(data.reason || "");
  writeDurationValues_(sheet, targetRow.rowNumber, data.newTimeIn || "", data.newTimeOut || "");

  return jsonResponse_({
    status: "success",
    action: "EDIT",
    rowNumber: targetRow.rowNumber
  });
}

function getLogsSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOGS_SHEET_NAME) ||
    SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function getLogRecords_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastColumn = Math.max(sheet.getLastColumn(), LOG_COL.DECIMAL_HOURS);
  var records = [];

  if (lastRow < 2) {
    return records;
  }

  var displayValues = sheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
  for (var i = 1; i < displayValues.length; i++) {
    if (!displayValues[i][LOG_COL.NAME - 1]) {
      continue;
    }
    records.push(buildLogRecord_(displayValues[i], i + 1));
  }

  return records;
}

function buildLogRecord_(row, rowNumber) {
  return {
    rowNumber: rowNumber,
    dateRaw: row[LOG_COL.DAY - 1],
    dateKey: normalizeDateKey_(row[LOG_COL.DAY - 1]),
    name: row[LOG_COL.NAME - 1],
    schedIn: row[LOG_COL.SCHED_IN - 1],
    schedOut: row[LOG_COL.SCHED_OUT - 1],
    timeIn: row[LOG_COL.TIME_IN - 1],
    timeOut: row[LOG_COL.TIME_OUT - 1],
    totalHours: row[LOG_COL.TOTAL_HOURS - 1],
    notes: row[LOG_COL.NOTES - 1],
    payrollStatus: row[LOG_COL.PAYROLL_STATUS - 1],
    scheduleStatus: row[LOG_COL.SCHEDULE_STATUS - 1],
    decimalHours: row[LOG_COL.DECIMAL_HOURS - 1]
  };
}

function resolveClockInRow_(records, data) {
  var keyMatch = findExactRowByKey_(records, data);
  if (keyMatch.found) {
    return keyMatch.row;
  }
  if (keyMatch.required) {
    throw new Error("The scheduled row for this clock-in changed before it could be saved. Please reload and try again.");
  }

  var targetDate = normalizeDateKey_(data.targetRowDate || data.date);
  var candidates = records.filter(function(record) {
    return record.name === data.name &&
      record.dateKey === targetDate &&
      !isLocked_(record) &&
      !hasValue_(record.timeIn) &&
      !hasValue_(record.timeOut);
  });

  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  var contextualMatches = applyPostedRowContext_(candidates, data);
  if (contextualMatches.length === 1) {
    return contextualMatches[0];
  }

  throw new Error("Multiple schedule rows match this clock-in. No time was saved.");
}

function resolveClockOutRow_(records, data) {
  var keyMatch = findExactRowByKey_(records, data);
  if (keyMatch.found) {
    return keyMatch.row;
  }
  if (keyMatch.required) {
    throw new Error("The open row for this clock-out could not be matched safely. Please reload before trying again.");
  }

  var targetDate = normalizeDateKey_(data.targetRowDate || data.date);
  var candidates = records.filter(function(record) {
    return record.name === data.name &&
      record.dateKey === targetDate &&
      !isLocked_(record) &&
      hasValue_(record.timeIn) &&
      !hasValue_(record.timeOut);
  });

  if (candidates.length === 1) {
    return candidates[0];
  }
  if (candidates.length === 0) {
    throw new Error("No open shift was found for " + data.name + " on " + targetDate + ".");
  }

  var contextualMatches = applyPostedRowContext_(candidates, data);
  if (contextualMatches.length === 1) {
    return contextualMatches[0];
  }

  throw new Error("Multiple open rows match this clock-out. No time was saved.");
}

function resolveEditRow_(records, data) {
  var keyMatch = findExactRowByKey_(records, data);
  if (keyMatch.found) {
    return keyMatch.row;
  }
  if (keyMatch.required) {
    throw new Error("The row being edited no longer matches the latest sheet data. Please reload and try again.");
  }

  var targetDate = normalizeDateKey_(data.targetRowDate || data.date);
  var candidates = records.filter(function(record) {
    return record.name === data.name &&
      record.dateKey === targetDate &&
      !isLocked_(record);
  });

  if (candidates.length === 1) {
    return candidates[0];
  }

  var contextualMatches = applyPostedRowContext_(candidates, data);
  if (contextualMatches.length === 1) {
    return contextualMatches[0];
  }

  if (candidates.length === 0) {
    return null;
  }

  throw new Error("Multiple rows match this edit. No changes were saved.");
}

function findExactRowByKey_(records, data) {
  var key = data.targetRowKey ? String(data.targetRowKey) : "";
  if (!key) {
    return { found: false, required: hasPostedRowContext_(data), row: null };
  }

  var matches = records.filter(function(record) {
    return !isLocked_(record) && buildRowFingerprint_(record) === key;
  });

  if (matches.length === 1) {
    return { found: true, required: true, row: matches[0] };
  }

  if (matches.length > 1) {
    throw new Error("Multiple rows matched the requested row signature. No changes were saved.");
  }

  return { found: false, required: true, row: null };
}

function applyPostedRowContext_(records, data) {
  var context = [
    { value: normalizeDateKey_(data.targetRowDate || data.date), getter: function(record) { return record.dateKey; } },
    { value: data.targetRowTimeIn || "", getter: function(record) { return record.timeIn || ""; } },
    { value: data.targetRowTimeOut || "", getter: function(record) { return record.timeOut || ""; } },
    { value: data.targetRowSchedIn || "", getter: function(record) { return record.schedIn || ""; } },
    { value: data.targetRowSchedOut || "", getter: function(record) { return record.schedOut || ""; } },
    { value: data.targetRowPayrollStatus || "", getter: function(record) { return record.payrollStatus || ""; } },
    { value: data.targetRowScheduleStatus || "", getter: function(record) { return record.scheduleStatus || ""; } }
  ];

  var hasAnyContext = context.some(function(item) {
    return hasValue_(item.value);
  });

  if (!hasAnyContext) {
    return records.slice();
  }

  return records.filter(function(record) {
    for (var i = 0; i < context.length; i++) {
      if (!hasValue_(context[i].value)) {
        continue;
      }
      if (String(context[i].getter(record)) !== String(context[i].value)) {
        return false;
      }
    }
    return true;
  });
}

function buildRowFingerprint_(record) {
  return JSON.stringify({
    date: record.dateKey || "",
    name: record.name || "",
    timeIn: record.timeIn || "",
    timeOut: record.timeOut || "",
    schedIn: record.schedIn || "",
    schedOut: record.schedOut || "",
    payrollStatus: record.payrollStatus || "",
    scheduleStatus: record.scheduleStatus || ""
  });
}

function hasPostedRowContext_(data) {
  return hasValue_(data.targetRowDate) ||
    hasValue_(data.targetRowTimeIn) ||
    hasValue_(data.targetRowTimeOut) ||
    hasValue_(data.targetRowSchedIn) ||
    hasValue_(data.targetRowSchedOut) ||
    hasValue_(data.targetRowPayrollStatus) ||
    hasValue_(data.targetRowScheduleStatus);
}

function isLocked_(record) {
  return String(record && record.payrollStatus ? record.payrollStatus : "")
    .trim()
    .toLowerCase() === "locked";
}

function writeDurationValues_(sheet, rowNumber, timeIn, timeOut) {
  var totalHoursRange = sheet.getRange(rowNumber, LOG_COL.TOTAL_HOURS);
  var decimalHoursRange = sheet.getRange(rowNumber, LOG_COL.DECIMAL_HOURS);
  var workedMinutes = calculateWorkedMinutes_(timeIn, timeOut);

  if (workedMinutes === null) {
    totalHoursRange.clearContent();
    decimalHoursRange.clearContent();
    return;
  }

  totalHoursRange.setNumberFormat("[h]:mm");
  totalHoursRange.setValue(workedMinutes / 1440);

  decimalHoursRange.setNumberFormat("0.00");
  decimalHoursRange.setValue(workedMinutes / 60);
}

function calculateWorkedMinutes_(startTime, endTime) {
  var startMinutes = parseClockTimeToMinutes_(startTime);
  var endMinutes = parseClockTimeToMinutes_(endTime);

  if (startMinutes === null || endMinutes === null) {
    return null;
  }

  var diff = endMinutes - startMinutes;
  if (diff < 0) {
    diff += 24 * 60;
  }

  return diff;
}

function parseClockTimeToMinutes_(value) {
  if (!hasValue_(value)) {
    return null;
  }

  var normalized = String(value).trim().replace(/\u202f/g, " ").toUpperCase();
  var match = normalized.match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/);
  if (!match) {
    return null;
  }

  var hour = parseInt(match[1], 10);
  var minute = parseInt(match[2], 10);
  var period = match[3];

  if (hour < 1 || hour > 12) {
    return null;
  }

  if (period === "AM") {
    if (hour === 12) {
      hour = 0;
    }
  } else if (hour !== 12) {
    hour += 12;
  }

  return (hour * 60) + minute;
}

function normalizeDateKey_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  if (value === null || value === undefined) {
    return "";
  }

  var text = String(value).trim();
  if (!text) {
    return "";
  }

  var isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return isoMatch[1] + "-" + pad2_(isoMatch[2]) + "-" + pad2_(isoMatch[3]);
  }

  var slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return slashMatch[3] + "-" + pad2_(slashMatch[1]) + "-" + pad2_(slashMatch[2]);
  }

  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  return text;
}

function validateRequiredFields_(data, fields) {
  for (var i = 0; i < fields.length; i++) {
    if (!hasValue_(data[fields[i]])) {
      throw new Error("Missing required field: " + fields[i]);
    }
  }
}

function hasValue_(value) {
  if (value === null || value === undefined) {
    return false;
  }

  var normalized = String(value).trim().toLowerCase();
  return normalized !== "" && normalized !== "-" && normalized !== "n/a";
}

function pad2_(value) {
  var text = String(value);
  return text.length === 1 ? "0" + text : text;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
