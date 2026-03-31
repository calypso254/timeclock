// --- CONFIGURATION ---
var EMPLOYEES_SHEET_NAME = "Employees";
var LOGS_SHEET_NAME = "Timesheet";
var SETTINGS_SHEET_NAME = "Settings";
var INVENTORY_SHEET_NAME = "Inventory";
var INVENTORY_LOG_SHEET_NAME = "Inventory Log";
var MESSAGES_SHEET_NAME = "Messages";
var PEN_HOSPITAL_SHEET_NAME = "Pen Hospital";
var SHOPIFY_API_VERSION = "2025-10";

/*
 * COLUMN MAPPING (Timesheet):
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

var SETTINGS_COL = {
  COMPANY_NAME: 1,
  LOGO_URL: 2,
  THEME_COLOR: 3,
  SHIFT_TEMPLATES: 4
};

var DEFAULT_ADMIN_SCHEDULE_STATUS = "Draft";
var TIME_OFF_STATUS = {
  REQUESTED: "Time Off Requested",
  APPROVED: "Time Off Approved"
};
var TIME_OFF_NOTE_KIND = "time_off";

var INVENTORY_COL = {
  SKU: 1,
  PRODUCT: 2,
  NEEDED: 3,
  IN_PROCESS: 4,
  AWAITING_APPROVAL: 5,
  ADDED_TO_STORE: 6,
  STILL_NEEDED: 7,
  STATUS: 8,
  LAST_UPDATED: 9,
  INVENTORY_ITEM_ID: 10,
  VARIANT_ID: 11
};

var INVENTORY_LOG_COL = {
  TIMESTAMP: 1,
  SKU: 2,
  PRODUCT: 3,
  ACTION: 4,
  QTY: 5,
  BEFORE: 6,
  AFTER: 7,
  SHOPIFY_RESULT: 8,
  MESSAGE: 9
};

var MESSAGE_COL = {
  TIMESTAMP: 1,
  SENDER_NAME: 2,
  SENDER_ROLE: 3,
  MESSAGE: 4,
  REACTIONS: 5
};

var PEN_HOSPITAL_COL = {
  CREATED_AT: 1,
  CUSTOMER_NAME: 2,
  EXPECTED_COUNT: 3,
  PEN_NAMES: 4,
  DIAGNOSIS: 5,
  STATUS: 6,
  LAST_UPDATED: 7,
  CREATED_BY: 8,
  LAST_UPDATED_BY: 9,
  DIAGNOSED_AT: 10,
  DIAGNOSED_BY: 11,
  DISCHARGED_AT: 12,
  DISCHARGED_BY: 13
};

var MESSAGE_FETCH_LIMIT = 120;

var INVENTORY_STATUS = {
  OPEN: "Open",
  IN_PROCESS: "In Process",
  AWAITING_APPROVAL: "Awaiting Approval",
  COMPLETED: "Completed"
};

var PEN_HOSPITAL_STATUS = {
  DIAGNOSED: "Diagnosed",
  ADMITTED: "Admitted",
  IN_SURGERY: "In Surgery",
  IN_RECOVERY: "In Recovery",
  READY_FOR_RELEASE: "Ready For Release",
  DISCHARGED: "Discharged"
};

function doGet(e) {
  var type = (e && e.parameter && e.parameter.type) || "employees";

  if (type === "settings") {
    return getSettings_();
  }

  if (type === "logs") {
    return getLogs_();
  }

  if (type === "inventory") {
    return getInventory_();
  }

  if (type === "messages") {
    return getMessages_();
  }

  if (type === "pen_hospital") {
    return getPenHospital_();
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

    if (data.action === "ADMIN_UPSERT_SCHEDULE") {
      return handleAdminUpsertSchedule_(sheet, data);
    }

    if (data.action === "ADMIN_BATCH_UPSERT_SCHEDULES") {
      return handleAdminBatchUpsertSchedules_(sheet, data);
    }

    if (data.action === "REQUEST_TIME_OFF") {
      return handleRequestTimeOff_(sheet, data);
    }

    if (data.action === "ADMIN_APPROVE_TIME_OFF") {
      return handleAdminApproveTimeOff_(sheet, data);
    }

    if (data.action === "ADMIN_CLEAR_TIME_OFF") {
      return handleAdminClearTimeOff_(sheet, data);
    }

    if (data.action === "POST_MESSAGE") {
      return handlePostMessage_(data);
    }

    if (data.action === "TOGGLE_MESSAGE_REACTION") {
      return handleToggleMessageReaction_(data);
    }

    if (data.action === "PEN_HOSPITAL_CREATE_CASE") {
      return handleCreatePenHospitalCase_(data);
    }

    if (data.action === "PEN_HOSPITAL_UPDATE_STATUS") {
      return handleUpdatePenHospitalStatus_(data);
    }

    if (data.action === "SAVE_SHIFT_TEMPLATES") {
      return handleSaveShiftTemplates_(data);
    }

    if (data.action === "ADMIN_SET_PAYROLL_PERIOD_STATUS") {
      return handleAdminSetPayrollPeriodStatus_(sheet, data);
    }

    if (data.action === "INVENTORY_ADD_NEED") {
      return handleInventoryAddNeed_(data);
    }

    if (data.action === "INVENTORY_ADJUST_NEED") {
      return handleInventoryAdjustNeed_(data);
    }

    if (data.action === "INVENTORY_START") {
      return handleInventoryStart_(data);
    }

    if (data.action === "INVENTORY_FINISH") {
      return handleInventoryFinish_(data);
    }

    if (data.action === "INVENTORY_REJECT_AWAITING") {
      return handleInventoryRejectAwaiting_(data);
    }

    if (data.action === "INVENTORY_APPROVE") {
      return handleInventoryApprove_(data);
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
  var settings = {
    shiftTemplates: []
  };

  if (sheet) {
    ensureSettingsStorage_(sheet);
    var data = sheet.getDataRange().getDisplayValues();
    if (data.length >= 2) {
      settings = {
        companyName: data[1][SETTINGS_COL.COMPANY_NAME - 1],
        logoUrl: data[1][SETTINGS_COL.LOGO_URL - 1],
        themeColor: data[1][SETTINGS_COL.THEME_COLOR - 1],
        shiftTemplates: parseShiftTemplates_(data[1][SETTINGS_COL.SHIFT_TEMPLATES - 1])
      };
    }
  }

  return jsonResponse_(settings);
}

function handleSaveShiftTemplates_(data) {
  validateRequiredFields_(data, ["editorName", "editorRole"]);

  if (!isAdminRole_(data.editorRole)) {
    throw new Error("Unauthorized. Only admin-capable accounts can save shift templates.");
  }

  var nextTemplates = sanitizeShiftTemplates_(data.shiftTemplates);
  var sheet = getOrCreateSettingsSheet_();
  ensureSettingsStorage_(sheet);
  sheet.getRange(2, SETTINGS_COL.SHIFT_TEMPLATES).setValue(JSON.stringify(nextTemplates));

  return jsonResponse_({
    status: "success",
    action: "SAVE_SHIFT_TEMPLATES",
    shiftTemplates: nextTemplates
  });
}

function handleAdminSetPayrollPeriodStatus_(sheet, data) {
  validateRequiredFields_(data, ["editorName", "editorRole", "periodStart", "periodEnd"]);

  if (data.completed === undefined || data.completed === null || String(data.completed).trim() === "") {
    throw new Error("Missing required field: completed");
  }

  if (!isAdminRole_(data.editorRole)) {
    throw new Error("Unauthorized. Only admin-capable accounts can update payroll periods.");
  }

  var periodStart = normalizeDateKey_(data.periodStart);
  var periodEnd = normalizeDateKey_(data.periodEnd);
  if (!periodStart || !periodEnd) {
    throw new Error("A valid payroll period start and end date are required.");
  }
  if (periodStart > periodEnd) {
    throw new Error("Payroll period start cannot be after the end date.");
  }

  var shouldComplete = data.completed === true || String(data.completed).toLowerCase() === "true";
  var nextStatus = shouldComplete ? "Locked" : "Open";
  var records = getLogRecords_(sheet);
  var updatedCount = 0;

  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    if (!isPayrollRelevantRecord_(record)) {
      continue;
    }
    if (record.dateKey < periodStart || record.dateKey > periodEnd) {
      continue;
    }
    sheet.getRange(record.rowNumber, LOG_COL.PAYROLL_STATUS).setValue(nextStatus);
    updatedCount += 1;
  }

  return jsonResponse_({
    status: "success",
    action: "ADMIN_SET_PAYROLL_PERIOD_STATUS",
    periodStart: periodStart,
    periodEnd: periodEnd,
    completed: shouldComplete,
    updatedCount: updatedCount
  });
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

function getInventory_() {
  var sheet = getOrCreateInventorySheet_();
  ensureInventorySheetStructure_(sheet);
  return jsonResponse_(getInventoryRecords_(sheet));
}

function getMessages_() {
  var sheet = getOrCreateMessagesSheet_();
  ensureMessagesSheetStructure_(sheet);
  return jsonResponse_(getMessageRecords_(sheet));
}

function getPenHospital_() {
  var sheet = getOrCreatePenHospitalSheet_();
  ensurePenHospitalSheetStructure_(sheet);
  return jsonResponse_(getPenHospitalRecords_(sheet));
}

function handlePostMessage_(data) {
  validateRequiredFields_(data, ["editorName", "editorRole", "message"]);

  var senderName = String(data.editorName || "").trim();
  var senderRole = normalizeMessageSenderRole_(data.editorRole);
  var messageText = sanitizeMessageText_(data.message);

  if (!senderName) {
    throw new Error("Missing required field: editorName");
  }
  if (!messageText) {
    throw new Error("Enter a message before sending.");
  }
  if (messageText.length > 1000) {
    throw new Error("Messages must be 1000 characters or less.");
  }

  var sheet = getOrCreateMessagesSheet_();
  ensureMessagesSheetStructure_(sheet);
  var nextRow = Math.max(sheet.getLastRow(), 1) + 1;
  var submittedAt = data.submittedAt ? new Date(data.submittedAt) : new Date();
  if (Object.prototype.toString.call(submittedAt) !== "[object Date]" || isNaN(submittedAt.getTime())) {
    submittedAt = new Date();
  }

  sheet.getRange(nextRow, 1, 1, MESSAGE_COL.REACTIONS).setValues([[
    submittedAt,
    senderName,
    senderRole,
    messageText,
    ""
  ]]);
  sheet.getRange(nextRow, MESSAGE_COL.TIMESTAMP).setNumberFormat("m/d/yyyy h:mm:ss am/pm");

  return jsonResponse_({
    status: "success",
    action: "POST_MESSAGE",
    messageRow: {
      rowNumber: nextRow,
      senderName: senderName,
      senderRole: senderRole,
      message: messageText,
      reactions: []
    }
  });
}

function handleToggleMessageReaction_(data) {
  validateRequiredFields_(data, ["rowNumber", "editorName", "editorRole", "reaction"]);

  var rowNumber = parseMessageRowNumber_(data.rowNumber);
  var actorName = String(data.editorName || "").trim();
  var actorRole = normalizeMessageSenderRole_(data.editorRole);
  var reactionKey = sanitizeMessageReactionKey_(data.reaction);
  if (!actorName) {
    throw new Error("Missing required field: editorName");
  }
  if (!reactionKey) {
    throw new Error("Choose a valid reaction.");
  }

  var sheet = getOrCreateMessagesSheet_();
  ensureMessagesSheetStructure_(sheet);
  var messageRecord = getMessageRecordByRowNumber_(sheet, rowNumber);
  if (!messageRecord) {
    throw new Error("That message could not be found.");
  }

  var updatedAt = hasValue_(data.submittedAt) ? String(data.submittedAt).trim() : new Date().toISOString();
  var nextReactions = toggleMessageReactionEntries_(messageRecord.reactions, {
    name: actorName,
    role: actorRole,
    reaction: reactionKey,
    updatedAt: updatedAt
  });
  var serializedReactions = serializeMessageReactionEntries_(nextReactions);
  var reactionRange = sheet.getRange(rowNumber, MESSAGE_COL.REACTIONS);
  if (serializedReactions) {
    reactionRange.setValue(serializedReactions);
  } else {
    reactionRange.clearContent();
  }

  return jsonResponse_({
    status: "success",
    action: "TOGGLE_MESSAGE_REACTION",
    messageRow: getMessageRecordByRowNumber_(sheet, rowNumber)
  });
}

function handleCreatePenHospitalCase_(data) {
  validateRequiredFields_(data, ["customerName", "expectedCount", "editorName", "editorRole"]);

  if (!isAdminRole_(data.editorRole)) {
    throw new Error("Unauthorized. Only admin-capable accounts can create Pen Hospital cases.");
  }

  var editorName = String(data.editorName || "").trim();
  var customerName = sanitizePenHospitalCustomerName_(data.customerName);
  var expectedCount = parseIntegerQuantity_(data.expectedCount, "expectedCount", false);
  var diagnosis = sanitizePenHospitalDiagnosis_(hasValue_(data.diagnosis) ? data.diagnosis : data.diagnosisNotes);
  var penNames = sanitizePenHospitalPenNames_(data.penNames);
  if (!editorName) {
    throw new Error("Missing required field: editorName");
  }
  if (!customerName) {
    throw new Error("Enter a customer name for this Pen Hospital case.");
  }

  var sheet = getOrCreatePenHospitalSheet_();
  ensurePenHospitalSheetStructure_(sheet);
  var nextRow = Math.max(sheet.getLastRow(), 1) + 1;
  var submittedAt = toValidDateOrBlank_(data.submittedAt);
  if (!submittedAt) {
    submittedAt = new Date();
  }

  var savedRecord = writePenHospitalRecord_(sheet, nextRow, {
    rowNumber: nextRow,
    createdAt: submittedAt,
    customerName: customerName,
    expectedCount: expectedCount,
    diagnosis: diagnosis,
    penNames: penNames,
    status: PEN_HOSPITAL_STATUS.DIAGNOSED,
    lastUpdated: submittedAt,
    createdBy: editorName,
    lastUpdatedBy: editorName,
    diagnosedAt: submittedAt,
    diagnosedBy: editorName,
    dischargedAt: "",
    dischargedBy: ""
  });

  return jsonResponse_({
    status: "success",
    action: "PEN_HOSPITAL_CREATE_CASE",
    rowNumber: savedRecord.rowNumber,
    penHospitalCase: savedRecord
  });
}

function handleUpdatePenHospitalStatus_(data) {
  validateRequiredFields_(data, ["rowNumber", "status", "editorName", "editorRole"]);

  var rowNumber = parsePenHospitalRowNumber_(data.rowNumber);
  var editorName = String(data.editorName || "").trim();
  var nextStatus = sanitizePenHospitalStatus_(data.status);
  if (!editorName) {
    throw new Error("Missing required field: editorName");
  }
  if (!nextStatus) {
    throw new Error("Choose a valid Pen Hospital status.");
  }
  if (!canEditorSetPenHospitalStatus_(data.editorRole, nextStatus)) {
    throw new Error("Unauthorized. Only admin-capable accounts can set that Pen Hospital status.");
  }

  var sheet = getOrCreatePenHospitalSheet_();
  ensurePenHospitalSheetStructure_(sheet);
  var record = getPenHospitalRecordByRowNumber_(sheet, rowNumber);
  if (!record) {
    throw new Error("That Pen Hospital case could not be found.");
  }

  var submittedAt = toValidDateOrBlank_(data.submittedAt);
  if (!submittedAt) {
    submittedAt = new Date();
  }

  record.status = nextStatus;
  record.lastUpdated = submittedAt;
  record.lastUpdatedBy = editorName;
  if (nextStatus === PEN_HOSPITAL_STATUS.DIAGNOSED) {
    record.diagnosedAt = submittedAt;
    record.diagnosedBy = editorName;
  }
  if (nextStatus === PEN_HOSPITAL_STATUS.DISCHARGED) {
    record.dischargedAt = submittedAt;
    record.dischargedBy = editorName;
  } else {
    record.dischargedAt = "";
    record.dischargedBy = "";
  }

  var savedRecord = writePenHospitalRecord_(sheet, rowNumber, record);
  return jsonResponse_({
    status: "success",
    action: "PEN_HOSPITAL_UPDATE_STATUS",
    rowNumber: savedRecord.rowNumber,
    penHospitalCase: savedRecord
  });
}

function handleInventoryAddNeed_(data) {
  validateRequiredFields_(data, ["sku", "quantity", "editorName", "editorRole"]);
  validateAdminAction_(data);

  var quantity = parseIntegerQuantity_(data.quantity, "quantity", false);
  var sheet = getOrCreateInventorySheet_();
  ensureInventorySheetStructure_(sheet);

  var records = getInventoryRecords_(sheet);
  var existing = findOpenInventoryRecordBySku_(records, data.sku);
  var productInfo = existing ? getOptionalShopifyVariantBySku_(existing.sku || data.sku) : getOptionalShopifyVariantBySku_(data.sku);
  var beforeState = existing ? serializeInventoryState_(existing) : "";

  if (existing) {
    existing.needed += quantity;
    if (!hasValue_(existing.product) && hasValue_(data.product)) {
      existing.product = String(data.product).trim();
    }
    if (productInfo) {
      hydrateInventoryRecordFromShopify_(existing, productInfo);
    }
    var updatedExisting = writeInventoryRecord_(sheet, existing.rowNumber, existing);
    logInventoryAction_({
      sku: updatedExisting.sku,
      product: updatedExisting.product,
      action: "Need Added",
      quantity: quantity,
      beforeState: beforeState,
      afterState: serializeInventoryState_(updatedExisting),
      shopifyResult: "not_requested",
      message: "Need quantity increased by " + quantity + "."
    });
    return jsonResponse_({
      status: "success",
      action: "INVENTORY_ADD_NEED",
      rowNumber: updatedExisting.rowNumber,
      inventoryRow: updatedExisting
    });
  }

  var nextRow = Math.max(sheet.getLastRow() + 1, 2);
  var createdRecord = {
    rowNumber: nextRow,
    sku: normalizeSku_(data.sku),
    product: hasValue_(data.product) ? String(data.product).trim() : "",
    needed: quantity,
    inProcess: 0,
    awaitingApproval: 0,
    addedToStore: 0,
    inventoryItemId: "",
    variantId: ""
  };

  if (productInfo) {
    hydrateInventoryRecordFromShopify_(createdRecord, productInfo);
  } else if (!createdRecord.product) {
    createdRecord.product = "SKU " + createdRecord.sku;
  }

  var savedRecord = writeInventoryRecord_(sheet, nextRow, createdRecord);
  logInventoryAction_({
    sku: savedRecord.sku,
    product: savedRecord.product,
    action: "Need Created",
    quantity: quantity,
    beforeState: "",
    afterState: serializeInventoryState_(savedRecord),
    shopifyResult: "not_requested",
    message: "New inventory need created."
  });

  return jsonResponse_({
    status: "success",
    action: "INVENTORY_ADD_NEED",
    rowNumber: savedRecord.rowNumber,
    inventoryRow: savedRecord
  });
}

function handleInventoryAdjustNeed_(data) {
  validateRequiredFields_(data, ["rowNumber", "quantityDelta", "editorName", "editorRole"]);
  validateAdminAction_(data);

  var quantityDelta = parseIntegerQuantity_(data.quantityDelta, "quantityDelta", true);
  var sheet = getOrCreateInventorySheet_();
  ensureInventorySheetStructure_(sheet);

  var record = getInventoryRecordByRowNumber_(sheet, data.rowNumber);
  if (!record) {
    throw new Error("That inventory row could not be found.");
  }

  var minimumCovered = record.inProcess + record.awaitingApproval + record.addedToStore;
  var nextNeeded = record.needed + quantityDelta;
  if (nextNeeded < 0) {
    throw new Error("Needed quantity cannot go below 0.");
  }
  if (nextNeeded < minimumCovered) {
    throw new Error("Needed quantity cannot go below the amount already in process, awaiting approval, or added to Shopify.");
  }

  var beforeState = serializeInventoryState_(record);
  record.needed = nextNeeded;
  var savedRecord = writeInventoryRecord_(sheet, record.rowNumber, record);
  logInventoryAction_({
    sku: savedRecord.sku,
    product: savedRecord.product,
    action: "Need Adjusted",
    quantity: quantityDelta,
    beforeState: beforeState,
    afterState: serializeInventoryState_(savedRecord),
    shopifyResult: "not_requested",
    message: "Needed quantity adjusted by " + quantityDelta + "."
  });

  return jsonResponse_({
    status: "success",
    action: "INVENTORY_ADJUST_NEED",
    rowNumber: savedRecord.rowNumber,
    inventoryRow: savedRecord
  });
}

function handleInventoryStart_(data) {
  validateRequiredFields_(data, ["rowNumber", "quantity"]);

  var quantity = parseIntegerQuantity_(data.quantity, "quantity", false);
  var sheet = getOrCreateInventorySheet_();
  ensureInventorySheetStructure_(sheet);

  var record = getInventoryRecordByRowNumber_(sheet, data.rowNumber);
  if (!record) {
    throw new Error("That inventory row could not be found.");
  }
  if (record.status === INVENTORY_STATUS.COMPLETED) {
    throw new Error("This inventory row is already completed.");
  }
  if (quantity > record.stillNeeded) {
    throw new Error("Only " + record.stillNeeded + " item(s) are still needed for this row.");
  }

  var beforeState = serializeInventoryState_(record);
  record.inProcess += quantity;
  var savedRecord = writeInventoryRecord_(sheet, record.rowNumber, record);
  logInventoryAction_({
    sku: savedRecord.sku,
    product: savedRecord.product,
    action: "Started",
    quantity: quantity,
    beforeState: beforeState,
    afterState: serializeInventoryState_(savedRecord),
    shopifyResult: "not_requested",
    message: "Work started."
  });

  return jsonResponse_({
    status: "success",
    action: "INVENTORY_START",
    rowNumber: savedRecord.rowNumber,
    inventoryRow: savedRecord
  });
}

function handleInventoryFinish_(data) {
  validateRequiredFields_(data, ["rowNumber", "quantity"]);

  var quantity = parseIntegerQuantity_(data.quantity, "quantity", false);
  var sheet = getOrCreateInventorySheet_();
  ensureInventorySheetStructure_(sheet);

  var record = getInventoryRecordByRowNumber_(sheet, data.rowNumber);
  if (!record) {
    throw new Error("That inventory row could not be found.");
  }
  if (quantity > record.inProcess) {
    throw new Error("Only " + record.inProcess + " item(s) are currently marked in process.");
  }

  var beforeState = serializeInventoryState_(record);
  record.inProcess -= quantity;
  record.awaitingApproval += quantity;
  var savedRecord = writeInventoryRecord_(sheet, record.rowNumber, record);
  logInventoryAction_({
    sku: savedRecord.sku,
    product: savedRecord.product,
    action: "Finished",
    quantity: quantity,
    beforeState: beforeState,
    afterState: serializeInventoryState_(savedRecord),
    shopifyResult: "pending",
    message: "Finished quantity moved to Awaiting Approval."
  });

  return jsonResponse_({
    status: "success",
    action: "INVENTORY_FINISH",
    rowNumber: savedRecord.rowNumber,
    inventoryRow: savedRecord
  });
}

function handleInventoryRejectAwaiting_(data) {
  validateRequiredFields_(data, ["rowNumber", "quantity", "editorName", "editorRole"]);
  validateAdminAction_(data);

  var quantity = parseIntegerQuantity_(data.quantity, "quantity", false);
  var sheet = getOrCreateInventorySheet_();
  ensureInventorySheetStructure_(sheet);

  var record = getInventoryRecordByRowNumber_(sheet, data.rowNumber);
  if (!record) {
    throw new Error("That inventory row could not be found.");
  }
  if (quantity > record.awaitingApproval) {
    throw new Error("Only " + record.awaitingApproval + " item(s) are awaiting approval right now.");
  }

  var beforeState = serializeInventoryState_(record);
  record.awaitingApproval -= quantity;
  var savedRecord = writeInventoryRecord_(sheet, record.rowNumber, record);
  logInventoryAction_({
    sku: savedRecord.sku,
    product: savedRecord.product,
    action: "Awaiting Rejected",
    quantity: quantity,
    beforeState: beforeState,
    afterState: serializeInventoryState_(savedRecord),
    shopifyResult: "not_requested",
    message: "Awaiting Approval reduced by " + quantity + "."
  });

  return jsonResponse_({
    status: "success",
    action: "INVENTORY_REJECT_AWAITING",
    rowNumber: savedRecord.rowNumber,
    inventoryRow: savedRecord
  });
}

function handleInventoryApprove_(data) {
  validateRequiredFields_(data, ["rowNumber", "quantity", "editorName", "editorRole"]);
  validateAdminAction_(data);

  var quantity = parseIntegerQuantity_(data.quantity, "quantity", false);
  var sheet = getOrCreateInventorySheet_();
  ensureInventorySheetStructure_(sheet);

  var record = getInventoryRecordByRowNumber_(sheet, data.rowNumber);
  if (!record) {
    throw new Error("That inventory row could not be found.");
  }
  if (quantity > record.awaitingApproval) {
    throw new Error("Only " + record.awaitingApproval + " item(s) are awaiting approval right now.");
  }

  var beforeState = serializeInventoryState_(record);
  record.awaitingApproval -= quantity;
  record.addedToStore += quantity;

  var savedRecord = writeInventoryRecord_(sheet, record.rowNumber, record);
  logInventoryAction_({
    sku: savedRecord.sku,
    product: savedRecord.product,
    action: "Approved",
    quantity: quantity,
    beforeState: beforeState,
    afterState: serializeInventoryState_(savedRecord),
    shopifyResult: "not_requested",
    message: "Inventory was approved without posting to Shopify."
  });

  return jsonResponse_({
    status: "success",
    action: "INVENTORY_APPROVE",
    rowNumber: savedRecord.rowNumber,
    inventoryRow: savedRecord
  });
}

function getOrCreateInventorySheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(INVENTORY_SHEET_NAME) || spreadsheet.insertSheet(INVENTORY_SHEET_NAME);
}

function getOrCreateInventoryLogSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(INVENTORY_LOG_SHEET_NAME) || spreadsheet.insertSheet(INVENTORY_LOG_SHEET_NAME);
}

function getOrCreateMessagesSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(MESSAGES_SHEET_NAME) || spreadsheet.insertSheet(MESSAGES_SHEET_NAME);
}

function getOrCreatePenHospitalSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(PEN_HOSPITAL_SHEET_NAME) || spreadsheet.insertSheet(PEN_HOSPITAL_SHEET_NAME);
}

function ensureMessagesSheetStructure_(sheet) {
  var headers = [[
    "Timestamp",
    "Sender",
    "Role",
    "Message",
    "Reactions"
  ]];

  if (sheet.getMaxColumns() < headers[0].length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers[0].length - sheet.getMaxColumns());
  }

  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  sheet.setFrozenRows(1);
}

function ensurePenHospitalSheetStructure_(sheet) {
  var headers = [[
    "Created At",
    "Customer Name",
    "Expected Count",
    "Pen Names",
    "Diagnosis",
    "Status",
    "Last Updated",
    "Created By",
    "Last Updated By",
    "Diagnosed At",
    "Diagnosed By",
    "Discharged At",
    "Discharged By"
  ]];

  migrateLegacyPenHospitalDiagnosisColumn_(sheet);
  if (sheet.getMaxColumns() < headers[0].length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers[0].length - sheet.getMaxColumns());
  }

  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  sheet.setFrozenRows(1);
  ensurePenHospitalStatusValidation_(sheet);
}

function migrateLegacyPenHospitalDiagnosisColumn_(sheet) {
  var headerWidth = Math.max(sheet.getLastColumn(), Math.min(sheet.getMaxColumns(), PEN_HOSPITAL_COL.DISCHARGED_BY));
  if (headerWidth < PEN_HOSPITAL_COL.DIAGNOSIS) {
    return;
  }

  var currentHeaders = sheet.getRange(1, 1, 1, headerWidth).getDisplayValues()[0];
  var penNamesHeader = String(currentHeaders[PEN_HOSPITAL_COL.PEN_NAMES - 1] || "").trim();
  var diagnosisHeader = String(currentHeaders[PEN_HOSPITAL_COL.DIAGNOSIS - 1] || "").trim();
  var statusHeader = String(currentHeaders[PEN_HOSPITAL_COL.STATUS - 1] || "").trim();

  // Legacy sheets stored Status immediately after Pen Names and had no Diagnosis column.
  if (penNamesHeader === "Pen Names" &&
      diagnosisHeader === "Status" &&
      statusHeader === "Last Updated") {
    sheet.insertColumnAfter(PEN_HOSPITAL_COL.PEN_NAMES);
  }
}

function ensurePenHospitalStatusValidation_(sheet) {
  var validStatuses = [
    PEN_HOSPITAL_STATUS.DIAGNOSED,
    PEN_HOSPITAL_STATUS.ADMITTED,
    PEN_HOSPITAL_STATUS.IN_SURGERY,
    PEN_HOSPITAL_STATUS.IN_RECOVERY,
    PEN_HOSPITAL_STATUS.READY_FOR_RELEASE,
    PEN_HOSPITAL_STATUS.DISCHARGED
  ];
  var rowCount = Math.max(sheet.getMaxRows() - 1, 1);
  var statusRange = sheet.getRange(2, PEN_HOSPITAL_COL.STATUS, rowCount, 1);
  var validationRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(validStatuses, true)
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(validationRule);
}

function getMessageRecords_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  var startRow = Math.max(2, lastRow - MESSAGE_FETCH_LIMIT + 1);
  var rowCount = lastRow - startRow + 1;
  var rawValues = sheet.getRange(startRow, 1, rowCount, MESSAGE_COL.REACTIONS).getValues();
  var displayValues = sheet.getRange(startRow, 1, rowCount, MESSAGE_COL.REACTIONS).getDisplayValues();
  var records = [];

  for (var i = 0; i < displayValues.length; i++) {
    if (!hasValue_(displayValues[i][MESSAGE_COL.SENDER_NAME - 1]) &&
        !hasValue_(displayValues[i][MESSAGE_COL.MESSAGE - 1])) {
      continue;
    }
    records.push(buildMessageRecord_(rawValues[i], displayValues[i], startRow + i));
  }

  return records;
}

function buildMessageRecord_(rawRow, displayRow, rowNumber) {
  var timestampValue = rawRow[MESSAGE_COL.TIMESTAMP - 1];
  var isoTimestamp = "";
  if (Object.prototype.toString.call(timestampValue) === "[object Date]" && !isNaN(timestampValue.getTime())) {
    isoTimestamp = timestampValue.toISOString();
  }
  var reactions = sanitizeMessageReactionEntries_(rawRow[MESSAGE_COL.REACTIONS - 1]);

  return {
    rowNumber: rowNumber,
    timestamp: String(displayRow[MESSAGE_COL.TIMESTAMP - 1] || "").trim(),
    isoTimestamp: isoTimestamp,
    senderName: String(displayRow[MESSAGE_COL.SENDER_NAME - 1] || "").trim(),
    senderRole: normalizeMessageSenderRole_(displayRow[MESSAGE_COL.SENDER_ROLE - 1]),
    message: String(displayRow[MESSAGE_COL.MESSAGE - 1] || ""),
    reactions: reactions
  };
}

function getMessageRecordByRowNumber_(sheet, rowNumberValue) {
  var rowNumber = parseMessageRowNumber_(rowNumberValue);
  if (rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    return null;
  }

  var rawRow = sheet.getRange(rowNumber, 1, 1, MESSAGE_COL.REACTIONS).getValues()[0];
  var displayRow = sheet.getRange(rowNumber, 1, 1, MESSAGE_COL.REACTIONS).getDisplayValues()[0];
  if (!hasValue_(displayRow[MESSAGE_COL.SENDER_NAME - 1]) &&
      !hasValue_(displayRow[MESSAGE_COL.MESSAGE - 1])) {
    return null;
  }

  return buildMessageRecord_(rawRow, displayRow, rowNumber);
}

function ensureInventorySheetStructure_(sheet) {
  var headers = [[
    "SKU",
    "Product",
    "Needed",
    "In Process",
    "Awaiting Approval",
    "Approved",
    "Still Needed",
    "Status",
    "Last Updated",
    "Inventory Item ID",
    "Variant ID"
  ]];

  if (sheet.getMaxColumns() < headers[0].length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers[0].length - sheet.getMaxColumns());
  }

  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  sheet.setFrozenRows(1);
  ensureInventoryStatusValidation_(sheet);
}

function ensureInventoryStatusValidation_(sheet) {
  var validStatuses = [
    INVENTORY_STATUS.OPEN,
    INVENTORY_STATUS.IN_PROCESS,
    INVENTORY_STATUS.AWAITING_APPROVAL,
    INVENTORY_STATUS.COMPLETED
  ];
  var rowCount = Math.max(sheet.getMaxRows() - 1, 1);
  var statusRange = sheet.getRange(2, INVENTORY_COL.STATUS, rowCount, 1);
  var validationRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(validStatuses, true)
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(validationRule);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return;
  }

  var existingStatuses = sheet.getRange(2, INVENTORY_COL.STATUS, lastRow - 1, 1).getDisplayValues();
  var shouldRewriteStatuses = false;
  for (var i = 0; i < existingStatuses.length; i++) {
    if (String(existingStatuses[i][0] || "").trim() === "Complete") {
      existingStatuses[i][0] = INVENTORY_STATUS.COMPLETED;
      shouldRewriteStatuses = true;
    }
  }

  if (shouldRewriteStatuses) {
    sheet.getRange(2, INVENTORY_COL.STATUS, existingStatuses.length, 1).setValues(existingStatuses);
  }
}

function ensureInventoryLogSheetStructure_(sheet) {
  var headers = [[
    "Timestamp",
    "SKU",
    "Product",
    "Action",
    "Qty",
    "Before",
    "After",
    "Shopify Result",
    "Message"
  ]];

  if (sheet.getMaxColumns() < headers[0].length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers[0].length - sheet.getMaxColumns());
  }

  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  sheet.setFrozenRows(1);
}

function getInventoryRecords_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastColumn = Math.max(sheet.getLastColumn(), INVENTORY_COL.VARIANT_ID);
  var records = [];

  if (lastRow < 2) {
    return records;
  }

  var displayValues = sheet.getRange(2, 1, lastRow - 1, lastColumn).getDisplayValues();
  for (var i = 0; i < displayValues.length; i++) {
    if (!hasValue_(displayValues[i][INVENTORY_COL.SKU - 1]) &&
        !hasValue_(displayValues[i][INVENTORY_COL.PRODUCT - 1]) &&
        !hasValue_(displayValues[i][INVENTORY_COL.NEEDED - 1])) {
      continue;
    }
    records.push(buildInventoryRecord_(displayValues[i], i + 2));
  }

  return records;
}

function getPenHospitalRecords_(sheet) {
  var lastRow = sheet.getLastRow();
  var records = [];

  if (lastRow < 2) {
    return records;
  }

  var rawValues = sheet.getRange(2, 1, lastRow - 1, PEN_HOSPITAL_COL.DISCHARGED_BY).getValues();
  var displayValues = sheet.getRange(2, 1, lastRow - 1, PEN_HOSPITAL_COL.DISCHARGED_BY).getDisplayValues();
  for (var i = 0; i < displayValues.length; i++) {
    if (!hasValue_(displayValues[i][PEN_HOSPITAL_COL.CUSTOMER_NAME - 1]) &&
        !hasValue_(displayValues[i][PEN_HOSPITAL_COL.EXPECTED_COUNT - 1])) {
      continue;
    }
    records.push(buildPenHospitalRecord_(rawValues[i], displayValues[i], i + 2));
  }

  return records;
}

function buildInventoryRecord_(row, rowNumber) {
  var needed = parseSheetNumber_(row[INVENTORY_COL.NEEDED - 1]);
  var inProcess = parseSheetNumber_(row[INVENTORY_COL.IN_PROCESS - 1]);
  var awaitingApproval = parseSheetNumber_(row[INVENTORY_COL.AWAITING_APPROVAL - 1]);
  var addedToStore = parseSheetNumber_(row[INVENTORY_COL.ADDED_TO_STORE - 1]);
  var derived = computeInventoryDerivedFields_(needed, inProcess, awaitingApproval, addedToStore);

  return {
    rowNumber: rowNumber,
    sku: normalizeSku_(row[INVENTORY_COL.SKU - 1]),
    product: String(row[INVENTORY_COL.PRODUCT - 1] || "").trim(),
    needed: needed,
    inProcess: inProcess,
    awaitingApproval: awaitingApproval,
    addedToStore: addedToStore,
    stillNeeded: derived.stillNeeded,
    status: derived.status,
    lastUpdated: row[INVENTORY_COL.LAST_UPDATED - 1] || "",
    inventoryItemId: String(row[INVENTORY_COL.INVENTORY_ITEM_ID - 1] || "").trim(),
    variantId: String(row[INVENTORY_COL.VARIANT_ID - 1] || "").trim()
  };
}

function buildPenHospitalRecord_(rawRow, displayRow, rowNumber) {
  var status = sanitizePenHospitalStatus_(displayRow[PEN_HOSPITAL_COL.STATUS - 1]) || PEN_HOSPITAL_STATUS.DIAGNOSED;
  var diagnosis = sanitizePenHospitalDiagnosis_(displayRow[PEN_HOSPITAL_COL.DIAGNOSIS - 1]);
  return {
    rowNumber: rowNumber,
    createdAt: displayRow[PEN_HOSPITAL_COL.CREATED_AT - 1] || "",
    createdAtIso: dateValueToIsoString_(rawRow[PEN_HOSPITAL_COL.CREATED_AT - 1]),
    customerName: sanitizePenHospitalCustomerName_(displayRow[PEN_HOSPITAL_COL.CUSTOMER_NAME - 1]),
    expectedCount: parseSheetNumber_(displayRow[PEN_HOSPITAL_COL.EXPECTED_COUNT - 1]),
    penNames: sanitizePenHospitalPenNames_(displayRow[PEN_HOSPITAL_COL.PEN_NAMES - 1]),
    diagnosis: diagnosis,
    diagnosisNotes: diagnosis,
    status: status,
    lastUpdated: displayRow[PEN_HOSPITAL_COL.LAST_UPDATED - 1] || "",
    lastUpdatedIso: dateValueToIsoString_(rawRow[PEN_HOSPITAL_COL.LAST_UPDATED - 1]),
    createdBy: String(displayRow[PEN_HOSPITAL_COL.CREATED_BY - 1] || "").trim(),
    lastUpdatedBy: String(displayRow[PEN_HOSPITAL_COL.LAST_UPDATED_BY - 1] || "").trim(),
    diagnosedAt: displayRow[PEN_HOSPITAL_COL.DIAGNOSED_AT - 1] || "",
    diagnosedAtIso: dateValueToIsoString_(rawRow[PEN_HOSPITAL_COL.DIAGNOSED_AT - 1]),
    diagnosedBy: String(displayRow[PEN_HOSPITAL_COL.DIAGNOSED_BY - 1] || "").trim(),
    dischargedAt: displayRow[PEN_HOSPITAL_COL.DISCHARGED_AT - 1] || "",
    dischargedAtIso: dateValueToIsoString_(rawRow[PEN_HOSPITAL_COL.DISCHARGED_AT - 1]),
    dischargedBy: String(displayRow[PEN_HOSPITAL_COL.DISCHARGED_BY - 1] || "").trim()
  };
}

function computeInventoryDerivedFields_(needed, inProcess, awaitingApproval, addedToStore) {
  var stillNeeded = needed - inProcess - awaitingApproval - addedToStore;
  if (stillNeeded < 0) {
    stillNeeded = 0;
  }

  var status = INVENTORY_STATUS.OPEN;
  if (needed > 0 && addedToStore >= needed && inProcess === 0 && awaitingApproval === 0) {
    status = INVENTORY_STATUS.COMPLETED;
  } else if (awaitingApproval > 0) {
    status = INVENTORY_STATUS.AWAITING_APPROVAL;
  } else if (inProcess > 0) {
    status = INVENTORY_STATUS.IN_PROCESS;
  }

  return {
    stillNeeded: stillNeeded,
    status: status
  };
}

function writeInventoryRecord_(sheet, rowNumber, record) {
  var derived = computeInventoryDerivedFields_(record.needed, record.inProcess, record.awaitingApproval, record.addedToStore);
  var updatedAt = new Date();
  var values = [[
    normalizeSku_(record.sku),
    String(record.product || "").trim(),
    Math.max(0, parseSheetNumber_(record.needed)),
    Math.max(0, parseSheetNumber_(record.inProcess)),
    Math.max(0, parseSheetNumber_(record.awaitingApproval)),
    Math.max(0, parseSheetNumber_(record.addedToStore)),
    derived.stillNeeded,
    derived.status,
    updatedAt,
    String(record.inventoryItemId || "").trim(),
    String(record.variantId || "").trim()
  ]];

  sheet.getRange(rowNumber, 1, 1, values[0].length).setValues(values);
  sheet.getRange(rowNumber, INVENTORY_COL.LAST_UPDATED).setNumberFormat("m/d/yyyy h:mm:ss am/pm");

  record.rowNumber = rowNumber;
  record.sku = values[0][INVENTORY_COL.SKU - 1];
  record.product = values[0][INVENTORY_COL.PRODUCT - 1];
  record.needed = values[0][INVENTORY_COL.NEEDED - 1];
  record.inProcess = values[0][INVENTORY_COL.IN_PROCESS - 1];
  record.awaitingApproval = values[0][INVENTORY_COL.AWAITING_APPROVAL - 1];
  record.addedToStore = values[0][INVENTORY_COL.ADDED_TO_STORE - 1];
  record.stillNeeded = derived.stillNeeded;
  record.status = derived.status;
  record.lastUpdated = Utilities.formatDate(updatedAt, Session.getScriptTimeZone(), "M/d/yyyy h:mm:ss a");
  record.inventoryItemId = values[0][INVENTORY_COL.INVENTORY_ITEM_ID - 1];
  record.variantId = values[0][INVENTORY_COL.VARIANT_ID - 1];
  return record;
}

function writePenHospitalRecord_(sheet, rowNumber, record) {
  var createdAt = toValidDateOrBlank_(record.createdAt);
  var lastUpdated = toValidDateOrBlank_(record.lastUpdated);
  var diagnosedAt = toValidDateOrBlank_(record.diagnosedAt);
  var dischargedAt = toValidDateOrBlank_(record.dischargedAt);
  var status = sanitizePenHospitalStatus_(record.status) || PEN_HOSPITAL_STATUS.DIAGNOSED;
  var values = [[
    createdAt || new Date(),
    sanitizePenHospitalCustomerName_(record.customerName),
    parseSheetNumber_(record.expectedCount),
    sanitizePenHospitalPenNames_(record.penNames),
    sanitizePenHospitalDiagnosis_(hasValue_(record.diagnosis) ? record.diagnosis : record.diagnosisNotes),
    status,
    lastUpdated || new Date(),
    String(record.createdBy || "").trim(),
    String(record.lastUpdatedBy || "").trim(),
    diagnosedAt || "",
    String(record.diagnosedBy || "").trim(),
    dischargedAt || "",
    String(record.dischargedBy || "").trim()
  ]];

  sheet.getRange(rowNumber, 1, 1, values[0].length).setValues(values);
  sheet.getRange(rowNumber, PEN_HOSPITAL_COL.CREATED_AT).setNumberFormat("m/d/yyyy h:mm:ss am/pm");
  sheet.getRange(rowNumber, PEN_HOSPITAL_COL.LAST_UPDATED).setNumberFormat("m/d/yyyy h:mm:ss am/pm");
  if (diagnosedAt) {
    sheet.getRange(rowNumber, PEN_HOSPITAL_COL.DIAGNOSED_AT).setNumberFormat("m/d/yyyy h:mm:ss am/pm");
  }
  if (dischargedAt) {
    sheet.getRange(rowNumber, PEN_HOSPITAL_COL.DISCHARGED_AT).setNumberFormat("m/d/yyyy h:mm:ss am/pm");
  }

  var rawRow = sheet.getRange(rowNumber, 1, 1, PEN_HOSPITAL_COL.DISCHARGED_BY).getValues()[0];
  var displayRow = sheet.getRange(rowNumber, 1, 1, PEN_HOSPITAL_COL.DISCHARGED_BY).getDisplayValues()[0];
  return buildPenHospitalRecord_(rawRow, displayRow, rowNumber);
}

function getInventoryRecordByRowNumber_(sheet, rowNumberValue) {
  var rowNumber = parseRowNumber_(rowNumberValue);
  if (rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    return null;
  }

  var values = sheet.getRange(rowNumber, 1, 1, Math.max(sheet.getLastColumn(), INVENTORY_COL.VARIANT_ID)).getDisplayValues()[0];
  if (!hasValue_(values[INVENTORY_COL.SKU - 1]) &&
      !hasValue_(values[INVENTORY_COL.PRODUCT - 1]) &&
      !hasValue_(values[INVENTORY_COL.NEEDED - 1])) {
    return null;
  }

  return buildInventoryRecord_(values, rowNumber);
}

function getPenHospitalRecordByRowNumber_(sheet, rowNumberValue) {
  var rowNumber = parsePenHospitalRowNumber_(rowNumberValue);
  if (rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    return null;
  }

  var rawRow = sheet.getRange(rowNumber, 1, 1, PEN_HOSPITAL_COL.DISCHARGED_BY).getValues()[0];
  var displayRow = sheet.getRange(rowNumber, 1, 1, PEN_HOSPITAL_COL.DISCHARGED_BY).getDisplayValues()[0];
  if (!hasValue_(displayRow[PEN_HOSPITAL_COL.CUSTOMER_NAME - 1]) &&
      !hasValue_(displayRow[PEN_HOSPITAL_COL.EXPECTED_COUNT - 1])) {
    return null;
  }

  return buildPenHospitalRecord_(rawRow, displayRow, rowNumber);
}

function findOpenInventoryRecordBySku_(records, sku) {
  var normalizedSku = normalizeSku_(sku);
  var matches = records.filter(function(record) {
    return normalizeSku_(record.sku) === normalizedSku && record.status !== INVENTORY_STATUS.COMPLETED;
  });

  if (matches.length === 0) {
    return null;
  }

  return matches[matches.length - 1];
}

function normalizeSku_(value) {
  return String(value || "").trim().toUpperCase();
}

function parseSheetNumber_(value) {
  if (!hasValue_(value)) {
    return 0;
  }

  var normalized = String(value).replace(/,/g, "").trim();
  var parsed = Number(normalized);
  if (isNaN(parsed)) {
    return 0;
  }
  return Math.round(parsed);
}

function parseIntegerQuantity_(value, fieldName, allowNegative) {
  if (value === null || value === undefined || String(value).trim() === "") {
    throw new Error("Missing required field: " + fieldName);
  }

  var quantity = Number(String(value).trim());
  if (isNaN(quantity) || !isFinite(quantity) || Math.floor(quantity) !== quantity) {
    throw new Error(fieldName + " must be a whole number.");
  }

  if (allowNegative) {
    if (quantity === 0) {
      throw new Error(fieldName + " cannot be 0.");
    }
  } else if (quantity <= 0) {
    throw new Error(fieldName + " must be greater than 0.");
  }

  return quantity;
}

function parseRowNumber_(value) {
  var rowNumber = Number(String(value || "").trim());
  if (isNaN(rowNumber) || !isFinite(rowNumber) || Math.floor(rowNumber) !== rowNumber) {
    throw new Error("Invalid inventory row number.");
  }
  return rowNumber;
}

function parseMessageRowNumber_(value) {
  var rowNumber = Number(String(value || "").trim());
  if (isNaN(rowNumber) || !isFinite(rowNumber) || Math.floor(rowNumber) !== rowNumber) {
    throw new Error("Invalid message row number.");
  }
  return rowNumber;
}

function parsePenHospitalRowNumber_(value) {
  var rowNumber = Number(String(value || "").trim());
  if (isNaN(rowNumber) || !isFinite(rowNumber) || Math.floor(rowNumber) !== rowNumber) {
    throw new Error("Invalid Pen Hospital row number.");
  }
  return rowNumber;
}

function validateAdminAction_(data) {
  if (!isAdminRole_(data.editorRole)) {
    throw new Error("Unauthorized. Only admin-capable accounts can perform this inventory action.");
  }
}

function serializeInventoryState_(record) {
  if (!record) {
    return "";
  }

  return "Needed " + record.needed +
    " | In Process " + record.inProcess +
    " | Awaiting Approval " + record.awaitingApproval +
    " | Approved " + record.addedToStore +
    " | Still Needed " + record.stillNeeded;
}

function logInventoryAction_(entry) {
  var sheet = getOrCreateInventoryLogSheet_();
  ensureInventoryLogSheetStructure_(sheet);

  var nextRow = Math.max(sheet.getLastRow() + 1, 2);
  sheet.getRange(nextRow, 1, 1, INVENTORY_LOG_COL.MESSAGE).setValues([[
    new Date(),
    String(entry && entry.sku ? entry.sku : "").trim(),
    String(entry && entry.product ? entry.product : "").trim(),
    String(entry && entry.action ? entry.action : "").trim(),
    entry && entry.quantity !== undefined ? entry.quantity : "",
    String(entry && entry.beforeState ? entry.beforeState : "").trim(),
    String(entry && entry.afterState ? entry.afterState : "").trim(),
    String(entry && entry.shopifyResult ? entry.shopifyResult : "").trim(),
    String(entry && entry.message ? entry.message : "").trim()
  ]]);
  sheet.getRange(nextRow, INVENTORY_LOG_COL.TIMESTAMP).setNumberFormat("m/d/yyyy h:mm:ss am/pm");
}

function hydrateInventoryRecordFromShopify_(record, shopifyInfo) {
  if (!record || !shopifyInfo) {
    return record;
  }

  if (hasValue_(shopifyInfo.product)) {
    record.product = String(shopifyInfo.product).trim();
  }
  if (hasValue_(shopifyInfo.inventoryItemId)) {
    record.inventoryItemId = String(shopifyInfo.inventoryItemId).trim();
  }
  if (hasValue_(shopifyInfo.variantId)) {
    record.variantId = String(shopifyInfo.variantId).trim();
  }

  return record;
}

function resolveShopifyInventoryInfo_(record) {
  if (hasValue_(record.inventoryItemId) && hasValue_(record.variantId)) {
    return {
      inventoryItemId: String(record.inventoryItemId).trim(),
      variantId: String(record.variantId).trim(),
      product: record.product || ""
    };
  }

  var lookup = getShopifyVariantBySku_(record.sku);
  return {
    inventoryItemId: lookup.inventoryItemId,
    variantId: lookup.variantId,
    product: lookup.product
  };
}

function getOptionalShopifyVariantBySku_(sku) {
  if (!isShopifyConfigured_()) {
    return null;
  }

  try {
    return getShopifyVariantBySku_(sku);
  } catch (err) {
    return null;
  }
}

function isShopifyConfigured_() {
  var props = PropertiesService.getScriptProperties();
  return hasValue_(props.getProperty("SHOPIFY_STORE_DOMAIN")) &&
    hasValue_(props.getProperty("SHOPIFY_ADMIN_ACCESS_TOKEN"));
}

function getShopifyVariantBySku_(sku) {
  var normalizedSku = normalizeSku_(sku);
  if (!normalizedSku) {
    throw new Error("A valid SKU is required before Shopify can be queried.");
  }

  var response = shopifyGraphqlRequest_(
    "query InventoryVariantLookup($query: String!) {" +
      " productVariants(first: 10, query: $query) {" +
      " edges {" +
      " node {" +
      " id" +
      " sku" +
      " title" +
      " product { title }" +
      " inventoryItem { id }" +
      " }" +
      " }" +
      " }" +
      "}",
    { query: "sku:" + normalizedSku }
  );

  var edges = (((response || {}).data || {}).productVariants || {}).edges || [];
  for (var i = 0; i < edges.length; i++) {
    var node = edges[i] && edges[i].node ? edges[i].node : null;
    if (!node) {
      continue;
    }
    if (normalizeSku_(node.sku) !== normalizedSku) {
      continue;
    }

    var productTitle = node.product && node.product.title ? node.product.title : "";
    var variantTitle = node.title ? String(node.title).trim() : "";
    var combinedTitle = productTitle;
    if (variantTitle && variantTitle.toLowerCase() !== "default title") {
      combinedTitle = productTitle ? (productTitle + " - " + variantTitle) : variantTitle;
    }

    return {
      variantId: String(node.id || "").trim(),
      inventoryItemId: String(node.inventoryItem && node.inventoryItem.id ? node.inventoryItem.id : "").trim(),
      product: combinedTitle || productTitle || normalizedSku
    };
  }

  throw new Error("Shopify could not find a product variant for SKU " + normalizedSku + ".");
}

function adjustShopifyInventory_(inventoryItemId, quantityDelta, record, data) {
  var locationId = getShopifyLocationId_();
  var referenceDocumentUri = "gid://pengems/InventoryApproval/" + encodeURIComponent(normalizeSku_(record.sku)) + "/" + encodeURIComponent(String(data.submittedAt || new Date().toISOString()));

  var response = shopifyGraphqlRequest_(
    "mutation InventoryAdjust($input: InventoryAdjustQuantitiesInput!) {" +
      " inventoryAdjustQuantities(input: $input) {" +
      " userErrors { field message }" +
      " inventoryAdjustmentGroup {" +
      " createdAt" +
      " reason" +
      " referenceDocumentUri" +
      " changes { name delta }" +
      " }" +
      " }" +
      "}",
    {
      input: {
        reason: "correction",
        name: "available",
        referenceDocumentUri: referenceDocumentUri,
        changes: [{
          delta: quantityDelta,
          inventoryItemId: inventoryItemId,
          locationId: locationId
        }]
      }
    }
  );

  var result = ((response || {}).data || {}).inventoryAdjustQuantities || {};
  var userErrors = result.userErrors || [];
  if (userErrors.length > 0) {
    throw new Error(userErrors[0].message || "Shopify rejected the inventory adjustment.");
  }

  return result.inventoryAdjustmentGroup || null;
}

function getShopifyLocationId_() {
  var props = PropertiesService.getScriptProperties();
  var configuredLocationId = props.getProperty("SHOPIFY_LOCATION_ID");
  if (hasValue_(configuredLocationId)) {
    return String(configuredLocationId).trim();
  }

  var response = shopifyGraphqlRequest_(
    "query InventoryLocations {" +
      " locations(first: 10) {" +
      " edges {" +
      " node {" +
      " id" +
      " name" +
      " }" +
      " }" +
      " }" +
      "}",
    {}
  );

  var edges = (((response || {}).data || {}).locations || {}).edges || [];
  if (edges.length === 1 && edges[0] && edges[0].node && hasValue_(edges[0].node.id)) {
    return String(edges[0].node.id).trim();
  }

  throw new Error("Shopify location could not be resolved automatically. Set SHOPIFY_LOCATION_ID in Script Properties.");
}

function shopifyGraphqlRequest_(query, variables) {
  var props = PropertiesService.getScriptProperties();
  var storeDomain = String(props.getProperty("SHOPIFY_STORE_DOMAIN") || "").trim();
  var accessToken = String(props.getProperty("SHOPIFY_ADMIN_ACCESS_TOKEN") || "").trim();

  if (!storeDomain || !accessToken) {
    throw new Error("Shopify integration is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN in Script Properties.");
  }

  var normalizedDomain = storeDomain
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  var endpoint = "https://" + normalizedDomain + "/admin/api/" + SHOPIFY_API_VERSION + "/graphql.json";

  var response = UrlFetchApp.fetch(endpoint, {
    method: "post",
    contentType: "application/json",
    headers: {
      "X-Shopify-Access-Token": accessToken
    },
    payload: JSON.stringify({
      query: query,
      variables: variables || {}
    }),
    muteHttpExceptions: true
  });

  var statusCode = response.getResponseCode();
  var bodyText = response.getContentText();
  var parsed = {};

  if (bodyText) {
    parsed = JSON.parse(bodyText);
  }

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error("Shopify request failed (" + statusCode + ").");
  }

  if (parsed.errors && parsed.errors.length > 0) {
    throw new Error(parsed.errors[0].message || "Shopify returned a GraphQL error.");
  }

  return parsed;
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
  if (String(data.resolutionCode || "") === "midnight-auto-clock-out") {
    writeWorkedMinutes_(sheet, targetRow.rowNumber, calculateMinutesUntilMidnight_(targetRow.timeIn));
  } else {
    writeDurationValues_(sheet, targetRow.rowNumber, targetRow.timeIn, data.time);
  }

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

function handleAdminUpsertSchedule_(sheet, data) {
  var records = getLogRecords_(sheet);
  return jsonResponse_(upsertAdminScheduleEntry_(sheet, records, data));
}

function handleAdminBatchUpsertSchedules_(sheet, data) {
  validateRequiredFields_(data, ["editorName", "editorRole"]);

  if (!isAdminRole_(data.editorRole)) {
    throw new Error("Unauthorized. Only admin-capable accounts can save schedules.");
  }

  if (!Array.isArray(data.entries) || data.entries.length === 0) {
    throw new Error("No schedule entries were provided for the weekly save.");
  }

  var results = [];
  for (var i = 0; i < data.entries.length; i++) {
    var entry = data.entries[i] || {};
    var mergedEntry = {
      name: entry.name,
      date: entry.date,
      schedIn: entry.schedIn,
      schedOut: entry.schedOut,
      scheduleStatus: entry.scheduleStatus,
      clearSchedule: entry.clearSchedule,
      editorName: data.editorName,
      editorRole: data.editorRole,
      targetRowDate: entry.targetRowDate,
      targetRowKey: entry.targetRowKey,
      targetRowTimeIn: entry.targetRowTimeIn,
      targetRowTimeOut: entry.targetRowTimeOut,
      targetRowSchedIn: entry.targetRowSchedIn,
      targetRowSchedOut: entry.targetRowSchedOut,
      targetRowPayrollStatus: entry.targetRowPayrollStatus,
      targetRowScheduleStatus: entry.targetRowScheduleStatus
    };
    var records = getLogRecords_(sheet);
    results.push(upsertAdminScheduleEntry_(sheet, records, mergedEntry));
  }

  return jsonResponse_({
    status: "success",
    action: "ADMIN_BATCH_UPSERT_SCHEDULES",
    count: results.length,
    results: results
  });
}

function handleRequestTimeOff_(sheet, data) {
  validateRequiredFields_(data, ["name", "date", "editorName", "editorRole"]);

  var editorName = String(data.editorName || "");
  var editorRole = String(data.editorRole || "employee").toLowerCase();
  var targetName = String(data.name || "");
  if (editorRole === "employee" && editorName !== targetName) {
    throw new Error("Unauthorized. Employees can only request time off for themselves.");
  }

  var targetDate = normalizeDateKey_(data.date);
  if (!targetDate) {
    throw new Error("A valid date is required for a time-off request.");
  }

  var todayKey = normalizeDateKey_(new Date());
  if (targetDate < todayKey) {
    throw new Error("Time-off requests can only be made for today or a future date.");
  }

  var fullDay = data.fullDay === true || String(data.fullDay).toLowerCase() === "true";
  var schedIn = "";
  var schedOut = "";
  if (!fullDay) {
    validateRequiredFields_(data, ["schedIn", "schedOut"]);
    schedIn = String(data.schedIn || "").trim();
    schedOut = String(data.schedOut || "").trim();
    if (!isValidTimeOffRange_(schedIn, schedOut)) {
      throw new Error("Enter a valid blocked time range.");
    }
  }

  var records = getLogRecords_(sheet);
  var sameDayWorkedRow = records.find(function(record) {
    return record.name === targetName &&
      record.dateKey === targetDate &&
      !isTimeOffRecord_(record) &&
      (hasValue_(record.timeIn) || hasValue_(record.timeOut) || hasValue_(record.totalHours) || hasValue_(record.decimalHours));
  });
  if (sameDayWorkedRow) {
    throw new Error("Time off cannot be requested for a day that already has worked hours.");
  }

  var targetRow = resolveTimeOffRow_(records, data, [TIME_OFF_STATUS.REQUESTED, TIME_OFF_STATUS.APPROVED]);
  if (targetRow && isApprovedTimeOffStatus_(targetRow.scheduleStatus)) {
    throw new Error("This day already has approved time off. Ask an admin to clear it before requesting different hours.");
  }

  var submittedAt = hasValue_(data.submittedAt) ? String(data.submittedAt) : new Date().toISOString();
  var existingNote = targetRow ? parseTimeOffNote_(targetRow.notes) : null;
  var nextNote = buildTimeOffNote_(existingNote, {
    fullDay: fullDay,
    requestedBy: editorName,
    requestedAt: existingNote && hasValue_(existingNote.requestedAt) ? existingNote.requestedAt : submittedAt,
    updatedAt: submittedAt,
    approvedBy: "",
    approvedAt: ""
  });

  if (targetRow) {
    writeTimeOffRow_(sheet, targetRow.rowNumber, {
      date: targetDate,
      name: targetName,
      schedIn: schedIn,
      schedOut: schedOut,
      scheduleStatus: TIME_OFF_STATUS.REQUESTED,
      note: stringifyTimeOffNote_(nextNote)
    });

    return jsonResponse_({
      status: "success",
      action: "REQUEST_TIME_OFF",
      rowNumber: targetRow.rowNumber,
      mode: "updated-existing-row"
    });
  }

  var nextRow = Math.max(sheet.getLastRow() + 1, 2);
  writeTimeOffRow_(sheet, nextRow, {
    date: targetDate,
    name: targetName,
    schedIn: schedIn,
    schedOut: schedOut,
    scheduleStatus: TIME_OFF_STATUS.REQUESTED,
    note: stringifyTimeOffNote_(nextNote)
  });

  return jsonResponse_({
    status: "success",
    action: "REQUEST_TIME_OFF",
    rowNumber: nextRow,
    mode: "appended-row"
  });
}

function handleAdminApproveTimeOff_(sheet, data) {
  validateRequiredFields_(data, ["name", "date", "editorName", "editorRole"]);

  if (!isAdminRole_(data.editorRole)) {
    throw new Error("Unauthorized. Only admin-capable accounts can approve time off.");
  }

  var records = getLogRecords_(sheet);
  var targetRow = resolveTimeOffRow_(records, data, [TIME_OFF_STATUS.REQUESTED, TIME_OFF_STATUS.APPROVED]);
  if (!targetRow) {
    throw new Error("The requested time-off row could not be found. Reload and try again.");
  }

  var submittedAt = hasValue_(data.submittedAt) ? String(data.submittedAt) : new Date().toISOString();
  var existingNote = parseTimeOffNote_(targetRow.notes);
  var nextNote = buildTimeOffNote_(existingNote, {
    fullDay: resolveTimeOffFullDay_(targetRow, existingNote),
    requestedBy: existingNote && hasValue_(existingNote.requestedBy) ? existingNote.requestedBy : targetRow.name,
    requestedAt: existingNote && hasValue_(existingNote.requestedAt) ? existingNote.requestedAt : submittedAt,
    updatedAt: submittedAt,
    approvedBy: String(data.editorName || ""),
    approvedAt: submittedAt
  });

  writeTimeOffRow_(sheet, targetRow.rowNumber, {
    date: targetRow.dateKey || normalizeDateKey_(data.date),
    name: targetRow.name,
    schedIn: targetRow.schedIn || "",
    schedOut: targetRow.schedOut || "",
    scheduleStatus: TIME_OFF_STATUS.APPROVED,
    note: stringifyTimeOffNote_(nextNote)
  });
  clearUnlockedScheduledRowsForTimeOff_(sheet, records, targetRow.rowNumber, targetRow.name, targetRow.dateKey);

  return jsonResponse_({
    status: "success",
    action: "ADMIN_APPROVE_TIME_OFF",
    rowNumber: targetRow.rowNumber
  });
}

function handleAdminClearTimeOff_(sheet, data) {
  validateRequiredFields_(data, ["name", "date", "editorName", "editorRole"]);

  if (!isAdminRole_(data.editorRole)) {
    throw new Error("Unauthorized. Only admin-capable accounts can clear time off.");
  }

  var records = getLogRecords_(sheet);
  var targetRow = resolveTimeOffRow_(records, data, [TIME_OFF_STATUS.REQUESTED, TIME_OFF_STATUS.APPROVED]);
  if (!targetRow) {
    return jsonResponse_({
      status: "success",
      action: "ADMIN_CLEAR_TIME_OFF",
      rowNumber: 0,
      mode: "already-clear"
    });
  }

  clearTimeOffRow_(sheet, targetRow.rowNumber);

  return jsonResponse_({
    status: "success",
    action: "ADMIN_CLEAR_TIME_OFF",
    rowNumber: targetRow.rowNumber,
    mode: "cleared-row"
  });
}

function upsertAdminScheduleEntry_(sheet, records, data) {
  validateRequiredFields_(data, ["name", "date", "editorName", "editorRole"]);

  if (!isAdminRole_(data.editorRole)) {
    throw new Error("Unauthorized. Only admin-capable accounts can save schedules.");
  }

  var shouldClear = data.clearSchedule === true || String(data.clearSchedule).toLowerCase() === "true";
  if (!shouldClear) {
    validateRequiredFields_(data, ["schedIn", "schedOut", "scheduleStatus"]);
    if (calculateWorkedMinutes_(data.schedIn, data.schedOut) === null) {
      throw new Error("Invalid scheduled in/out time format.");
    }
  }

  var targetRow = resolveScheduleRow_(records, data);

  if (shouldClear) {
    if (!targetRow) {
      return {
        status: "success",
        action: "ADMIN_UPSERT_SCHEDULE",
        rowNumber: 0,
        mode: "already-clear"
      };
    }

    sheet.getRange(targetRow.rowNumber, LOG_COL.DAY).setValue(data.date);
    sheet.getRange(targetRow.rowNumber, LOG_COL.NAME).setValue(data.name);
    sheet.getRange(targetRow.rowNumber, LOG_COL.SCHED_IN).clearContent();
    sheet.getRange(targetRow.rowNumber, LOG_COL.SCHED_OUT).clearContent();
    sheet.getRange(targetRow.rowNumber, LOG_COL.SCHEDULE_STATUS).clearContent();
    writeScheduledDurationValue_(sheet, targetRow.rowNumber, "", "");

    return {
      status: "success",
      action: "ADMIN_UPSERT_SCHEDULE",
      rowNumber: targetRow.rowNumber,
      mode: "cleared-existing-row"
    };
  }

  if (targetRow) {
    sheet.getRange(targetRow.rowNumber, LOG_COL.DAY).setValue(data.date);
    sheet.getRange(targetRow.rowNumber, LOG_COL.NAME).setValue(data.name);
    sheet.getRange(targetRow.rowNumber, LOG_COL.SCHED_IN).setValue(data.schedIn);
    sheet.getRange(targetRow.rowNumber, LOG_COL.SCHED_OUT).setValue(data.schedOut);
    sheet.getRange(targetRow.rowNumber, LOG_COL.SCHEDULE_STATUS).setValue(data.scheduleStatus);
    writeScheduledDurationValue_(sheet, targetRow.rowNumber, data.schedIn, data.schedOut);

    return {
      status: "success",
      action: "ADMIN_UPSERT_SCHEDULE",
      rowNumber: targetRow.rowNumber,
      mode: "updated-existing-row"
    };
  }

  var nextRow = Math.max(sheet.getLastRow() + 1, 2);
  sheet.getRange(nextRow, LOG_COL.DAY).setValue(data.date);
  sheet.getRange(nextRow, LOG_COL.NAME).setValue(data.name);
  sheet.getRange(nextRow, LOG_COL.SCHED_IN).setValue(data.schedIn);
  sheet.getRange(nextRow, LOG_COL.SCHED_OUT).setValue(data.schedOut);
  sheet.getRange(nextRow, LOG_COL.SCHEDULE_STATUS).setValue(data.scheduleStatus);
  writeScheduledDurationValue_(sheet, nextRow, data.schedIn, data.schedOut);

  return {
    status: "success",
    action: "ADMIN_UPSERT_SCHEDULE",
    rowNumber: nextRow,
    mode: "appended-row"
  };
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
      !isTimeOffRecord_(record) &&
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
      !isTimeOffRecord_(record) &&
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
      !isLocked_(record) &&
      !isTimeOffRecord_(record);
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

function resolveScheduleRow_(records, data) {
  var keyMatch = findExactRowByKey_(records, data);
  if (keyMatch.found) {
    return keyMatch.row;
  }
  if (keyMatch.required) {
    throw new Error("The schedule row changed before it could be updated. Please reload and try again.");
  }

  var targetDate = normalizeDateKey_(data.targetRowDate || data.date);
  var candidates = records.filter(function(record) {
    return record.name === data.name &&
      record.dateKey === targetDate &&
      !isLocked_(record) &&
      !isTimeOffRecord_(record);
  });

  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  var emptyPunchCandidates = candidates.filter(function(record) {
    return !hasValue_(record.timeIn) && !hasValue_(record.timeOut);
  });
  if (emptyPunchCandidates.length === 1) {
    return emptyPunchCandidates[0];
  }

  var contextualMatches = applyPostedRowContext_(candidates, data);
  if (contextualMatches.length === 1) {
    return contextualMatches[0];
  }

  throw new Error("Multiple rows match this schedule update. No schedule was saved.");
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

function resolveTimeOffRow_(records, data, allowedStatuses) {
  var keyMatch = findExactRowByKey_(records, data);
  if (keyMatch.found) {
    if (isTimeOffRecord_(keyMatch.row) && isAllowedTimeOffStatus_(keyMatch.row.scheduleStatus, allowedStatuses)) {
      return keyMatch.row;
    }
    throw new Error("The time-off row changed before it could be updated. Please reload and try again.");
  }
  if (keyMatch.required) {
    throw new Error("The time-off row changed before it could be updated. Please reload and try again.");
  }

  var targetDate = normalizeDateKey_(data.targetRowDate || data.date);
  var candidates = records.filter(function(record) {
    return record.name === data.name &&
      record.dateKey === targetDate &&
      !isLocked_(record) &&
      isTimeOffRecord_(record) &&
      isAllowedTimeOffStatus_(record.scheduleStatus, allowedStatuses);
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

  throw new Error("Multiple time-off rows match this request. Please reload and try again.");
}

function isAllowedTimeOffStatus_(status, allowedStatuses) {
  if (!Array.isArray(allowedStatuses) || allowedStatuses.length === 0) {
    return isTimeOffStatus_(status);
  }

  var normalizedStatus = String(status || "").trim().toLowerCase();
  for (var i = 0; i < allowedStatuses.length; i++) {
    if (normalizedStatus === String(allowedStatuses[i] || "").trim().toLowerCase()) {
      return true;
    }
  }
  return false;
}

function isTimeOffStatus_(status) {
  var normalized = String(status || "").trim().toLowerCase();
  return normalized === String(TIME_OFF_STATUS.REQUESTED).toLowerCase() ||
    normalized === String(TIME_OFF_STATUS.APPROVED).toLowerCase();
}

function isApprovedTimeOffStatus_(status) {
  return String(status || "").trim().toLowerCase() === String(TIME_OFF_STATUS.APPROVED).toLowerCase();
}

function parseTimeOffNote_(value) {
  if (!hasValue_(value)) {
    return null;
  }

  try {
    var parsed = JSON.parse(String(value));
    if (!parsed || typeof parsed !== "object" || parsed.kind !== TIME_OFF_NOTE_KIND) {
      return null;
    }
    return parsed;
  } catch (err) {
    return null;
  }
}

function buildTimeOffNote_(baseNote, overrides) {
  var base = baseNote && typeof baseNote === "object" ? baseNote : {};
  var next = overrides && typeof overrides === "object" ? overrides : {};
  var fullDayOverride = next.fullDay === true || String(next.fullDay).toLowerCase() === "true";

  return {
    kind: TIME_OFF_NOTE_KIND,
    fullDay: next.fullDay === undefined ? (base.fullDay === true) : fullDayOverride,
    requestedBy: hasValue_(next.requestedBy) ? String(next.requestedBy) : String(base.requestedBy || ""),
    requestedAt: hasValue_(next.requestedAt) ? String(next.requestedAt) : String(base.requestedAt || ""),
    updatedAt: hasValue_(next.updatedAt) ? String(next.updatedAt) : String(base.updatedAt || ""),
    approvedBy: hasValue_(next.approvedBy) ? String(next.approvedBy) : String(base.approvedBy || ""),
    approvedAt: hasValue_(next.approvedAt) ? String(next.approvedAt) : String(base.approvedAt || "")
  };
}

function stringifyTimeOffNote_(note) {
  return JSON.stringify(note || {});
}

function resolveTimeOffFullDay_(record, note) {
  if (note && note.fullDay === true) {
    return true;
  }
  return !hasValue_(record && record.schedIn) && !hasValue_(record && record.schedOut);
}

function isTimeOffRecord_(record) {
  if (!record) {
    return false;
  }

  return isTimeOffStatus_(record.scheduleStatus) || Boolean(parseTimeOffNote_(record.notes));
}

function isValidTimeOffRange_(schedIn, schedOut) {
  var minutes = calculateWorkedMinutes_(schedIn, schedOut);
  return minutes !== null && minutes > 0;
}

function writeTimeOffRow_(sheet, rowNumber, data) {
  sheet.getRange(rowNumber, LOG_COL.DAY).setValue(data.date);
  sheet.getRange(rowNumber, LOG_COL.NAME).setValue(data.name);

  if (hasValue_(data.schedIn)) {
    sheet.getRange(rowNumber, LOG_COL.SCHED_IN).setValue(data.schedIn);
  } else {
    sheet.getRange(rowNumber, LOG_COL.SCHED_IN).clearContent();
  }

  if (hasValue_(data.schedOut)) {
    sheet.getRange(rowNumber, LOG_COL.SCHED_OUT).setValue(data.schedOut);
  } else {
    sheet.getRange(rowNumber, LOG_COL.SCHED_OUT).clearContent();
  }

  sheet.getRange(rowNumber, LOG_COL.TIME_IN).clearContent();
  sheet.getRange(rowNumber, LOG_COL.TIME_OUT).clearContent();
  sheet.getRange(rowNumber, LOG_COL.NOTES).setValue(data.note || "");
  sheet.getRange(rowNumber, LOG_COL.PAYROLL_STATUS).clearContent();
  sheet.getRange(rowNumber, LOG_COL.SCHEDULE_STATUS).setValue(data.scheduleStatus || "");
  writeDurationValues_(sheet, rowNumber, "", "");
  writeScheduledDurationValue_(sheet, rowNumber, "", "");
}

function clearUnlockedScheduledRowsForTimeOff_(sheet, records, excludedRowNumber, employeeName, dateKey) {
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    if (record.rowNumber === excludedRowNumber) {
      continue;
    }
    if (record.name !== employeeName || record.dateKey !== dateKey) {
      continue;
    }
    if (isLocked_(record) || isTimeOffRecord_(record)) {
      continue;
    }
    if (hasValue_(record.timeIn) || hasValue_(record.timeOut) || hasValue_(record.totalHours) || hasValue_(record.decimalHours)) {
      continue;
    }

    sheet.getRange(record.rowNumber, LOG_COL.SCHED_IN).clearContent();
    sheet.getRange(record.rowNumber, LOG_COL.SCHED_OUT).clearContent();
    sheet.getRange(record.rowNumber, LOG_COL.SCHEDULE_STATUS).clearContent();
    writeScheduledDurationValue_(sheet, record.rowNumber, "", "");
  }
}

function clearTimeOffRow_(sheet, rowNumber) {
  sheet.getRange(rowNumber, 1, 1, LOG_COL.DECIMAL_HOURS).clearContent();
}

function isPayrollRelevantRecord_(record) {
  if (!record) {
    return false;
  }

  return hasValue_(record.timeIn) ||
    hasValue_(record.timeOut) ||
    hasValue_(record.totalHours) ||
    hasValue_(record.decimalHours);
}

function isAdminRole_(role) {
  var normalized = String(role || "").trim().toLowerCase();
  return normalized === "admin" || normalized === "manager" || normalized === "owner";
}

function normalizeMessageSenderRole_(role) {
  var normalized = String(role || "").trim().toLowerCase();
  return isAdminRole_(normalized) ? "admin" : (normalized || "employee");
}

function sanitizePenHospitalStatus_(value) {
  var normalized = String(value || "").trim().toLowerCase();
  if (normalized === PEN_HOSPITAL_STATUS.DIAGNOSED.toLowerCase()) {
    return PEN_HOSPITAL_STATUS.DIAGNOSED;
  }
  if (normalized === PEN_HOSPITAL_STATUS.ADMITTED.toLowerCase()) {
    return PEN_HOSPITAL_STATUS.ADMITTED;
  }
  if (normalized === PEN_HOSPITAL_STATUS.IN_SURGERY.toLowerCase()) {
    return PEN_HOSPITAL_STATUS.IN_SURGERY;
  }
  if (normalized === PEN_HOSPITAL_STATUS.IN_RECOVERY.toLowerCase()) {
    return PEN_HOSPITAL_STATUS.IN_RECOVERY;
  }
  if (normalized === PEN_HOSPITAL_STATUS.READY_FOR_RELEASE.toLowerCase()) {
    return PEN_HOSPITAL_STATUS.READY_FOR_RELEASE;
  }
  if (normalized === PEN_HOSPITAL_STATUS.DISCHARGED.toLowerCase()) {
    return PEN_HOSPITAL_STATUS.DISCHARGED;
  }
  return "";
}

function sanitizePenHospitalCustomerName_(value) {
  return String(value || "").trim().slice(0, 200);
}

function sanitizePenHospitalDiagnosis_(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, 300);
}

function sanitizePenHospitalPenNames_(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, 600);
}

function canEditorSetPenHospitalStatus_(role, status) {
  var nextStatus = sanitizePenHospitalStatus_(status);
  if (!nextStatus) {
    return false;
  }
  if (nextStatus === PEN_HOSPITAL_STATUS.DIAGNOSED || nextStatus === PEN_HOSPITAL_STATUS.DISCHARGED) {
    return isAdminRole_(role);
  }
  return true;
}

function sanitizeMessageReactionKey_(value) {
  var normalized = String(value || "").trim().toLowerCase();
  if (normalized === "thumbs_up" || normalized === "heart" || normalized === "star") {
    return normalized;
  }
  return "";
}

function sanitizeMessageReactionEntries_(value) {
  if (!value) {
    return [];
  }

  var parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch (err) {
      return [];
    }
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  var deduped = {};
  for (var i = 0; i < parsed.length; i++) {
    var entry = parsed[i];
    if (!entry || typeof entry !== "object") {
      continue;
    }

    var name = String(entry.name || entry.senderName || "").trim();
    var role = normalizeMessageSenderRole_(entry.role || entry.senderRole);
    var reaction = sanitizeMessageReactionKey_(entry.reaction || entry.key);
    var updatedAt = String(entry.updatedAt || entry.at || "").trim();
    if (!name || !reaction) {
      continue;
    }

    deduped[name.toLowerCase() + "|" + role] = {
      name: name,
      role: role,
      reaction: reaction,
      updatedAt: updatedAt
    };
  }

  return Object.keys(deduped).map(function(key) {
    return deduped[key];
  }).sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });
}

function serializeMessageReactionEntries_(entries) {
  var sanitized = sanitizeMessageReactionEntries_(entries);
  return sanitized.length ? JSON.stringify(sanitized) : "";
}

function toggleMessageReactionEntries_(entries, nextEntry) {
  var currentEntries = sanitizeMessageReactionEntries_(entries);
  var actorName = String(nextEntry && nextEntry.name || "").trim();
  var actorRole = normalizeMessageSenderRole_(nextEntry && nextEntry.role);
  var nextReaction = sanitizeMessageReactionKey_(nextEntry && nextEntry.reaction);
  if (!actorName || !nextReaction) {
    return currentEntries;
  }

  var actorKey = actorName.toLowerCase() + "|" + actorRole;
  var nextEntries = [];
  var matchedExisting = false;

  for (var i = 0; i < currentEntries.length; i++) {
    var entry = currentEntries[i];
    var entryKey = entry.name.toLowerCase() + "|" + entry.role;
    if (entryKey !== actorKey) {
      nextEntries.push(entry);
      continue;
    }

    matchedExisting = true;
    if (entry.reaction !== nextReaction) {
      nextEntries.push({
        name: actorName,
        role: actorRole,
        reaction: nextReaction,
        updatedAt: String(nextEntry.updatedAt || "").trim()
      });
    }
  }

  if (!matchedExisting) {
    nextEntries.push({
      name: actorName,
      role: actorRole,
      reaction: nextReaction,
      updatedAt: String(nextEntry.updatedAt || "").trim()
    });
  }

  return sanitizeMessageReactionEntries_(nextEntries);
}

function getOrCreateSettingsSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SETTINGS_SHEET_NAME) || spreadsheet.insertSheet(SETTINGS_SHEET_NAME);
}

function ensureSettingsStorage_(sheet) {
  if (sheet.getMaxRows() < 2) {
    sheet.insertRowsAfter(sheet.getMaxRows(), 2 - sheet.getMaxRows());
  }

  if (sheet.getMaxColumns() < SETTINGS_COL.SHIFT_TEMPLATES) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), SETTINGS_COL.SHIFT_TEMPLATES - sheet.getMaxColumns());
  }

  var headerRange = sheet.getRange(1, 1, 1, SETTINGS_COL.SHIFT_TEMPLATES);
  var currentHeaders = headerRange.getValues()[0];
  var expectedHeaders = ["Company Name", "Logo URL", "Theme Color", "Shift Templates"];
  var shouldWriteHeaders = currentHeaders.every(function(value) {
    return !String(value || "").trim();
  });

  if (shouldWriteHeaders) {
    headerRange.setValues([expectedHeaders]);
  }
}

function parseShiftTemplates_(rawValue) {
  if (!rawValue) {
    return [];
  }

  try {
    return sanitizeShiftTemplates_(JSON.parse(rawValue));
  } catch (err) {
    return [];
  }
}

function sanitizeShiftTemplates_(templates) {
  if (!Array.isArray(templates)) {
    return [];
  }

  var results = [];
  var seenIds = {};

  for (var i = 0; i < templates.length; i++) {
    var template = templates[i];
    if (!template || typeof template !== "object") {
      continue;
    }

    var label = String(template.label || "").trim();
    var schedIn = String(template.schedIn || "").trim();
    var schedOut = String(template.schedOut || "").trim();
    var scheduleStatus = String(template.scheduleStatus || DEFAULT_ADMIN_SCHEDULE_STATUS).trim() || DEFAULT_ADMIN_SCHEDULE_STATUS;
    var templateId = String(template.id || buildTemplateId_(label, i)).trim();

    if (!label || !templateId) {
      continue;
    }
    if (calculateWorkedMinutes_(schedIn, schedOut) === null) {
      continue;
    }
    if (seenIds[templateId]) {
      continue;
    }

    seenIds[templateId] = true;
    results.push({
      id: templateId,
      label: label,
      schedIn: schedIn,
      schedOut: schedOut,
      scheduleStatus: scheduleStatus
    });
  }

  return results;
}

function buildTemplateId_(label, index) {
  var base = String(label || "template")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!base) {
    base = "template";
  }
  return base + "-" + index;
}

function writeWorkedMinutes_(sheet, rowNumber, workedMinutes) {
  var totalHoursRange = sheet.getRange(rowNumber, LOG_COL.TOTAL_HOURS);
  var decimalHoursRange = sheet.getRange(rowNumber, LOG_COL.DECIMAL_HOURS);

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

function writeDurationValues_(sheet, rowNumber, timeIn, timeOut) {
  var workedMinutes = calculateWorkedMinutes_(timeIn, timeOut);
  writeWorkedMinutes_(sheet, rowNumber, workedMinutes);
}

function writeScheduledDurationValue_(sheet, rowNumber, schedIn, schedOut) {
  var totalScheduledRange = sheet.getRange(rowNumber, LOG_COL.TOTAL_SCHEDULED);
  var scheduledMinutes = calculateWorkedMinutes_(schedIn, schedOut);

  if (scheduledMinutes === null) {
    totalScheduledRange.clearContent();
    return;
  }

  totalScheduledRange.setNumberFormat("[h]:mm");
  totalScheduledRange.setValue(scheduledMinutes / 1440);
}

function sanitizeMessageText_(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
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

function calculateMinutesUntilMidnight_(startTime) {
  var startMinutes = parseClockTimeToMinutes_(startTime);
  if (startMinutes === null) {
    return null;
  }

  return (24 * 60) - startMinutes;
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

function toValidDateOrBlank_(value) {
  if (!hasValue_(value)) {
    return "";
  }

  var dateValue = Object.prototype.toString.call(value) === "[object Date]"
    ? value
    : new Date(value);
  if (Object.prototype.toString.call(dateValue) !== "[object Date]" || isNaN(dateValue.getTime())) {
    return "";
  }
  return dateValue;
}

function dateValueToIsoString_(value) {
  var dateValue = toValidDateOrBlank_(value);
  return dateValue ? dateValue.toISOString() : "";
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
