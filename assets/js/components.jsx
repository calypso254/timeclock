// --- SUB-COMPONENTS ---

        const PinPad = ({ pinInput, handlePinPress, handlePinBackspace, handlePinClear, selectedEmployee, onCancel }) => (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in relative py-2 md:py-3">
                <div className="mb-2 md:mb-5 text-center shrink-0">
                    <h3 className="text-xl md:text-2xl font-bold font-poppins text-[#060606]">Enter PIN</h3>
                </div>
                
                <div className="flex gap-1.5 md:gap-2 mb-3 md:mb-5 h-7 md:h-9 shrink-0 items-center">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-black transition-all ${i < pinInput.length ? 'bg-[#38bdf8] scale-125' : 'bg-gray-200'}`}></div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-3 w-48 sm:w-52 md:w-56 lg:w-60 shrink-0 shadow-safe-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => handlePinPress(num.toString())} className="brutal-btn pin-btn bg-white hover:bg-gray-50 text-lg md:text-xl flex items-center justify-center">
                            {num}
                        </button>
                    ))}
                    <button onClick={handlePinClear} className="brutal-btn pin-btn bg-[#fde047] hover:bg-[#facc15] text-[#060606] text-[11px] md:text-sm uppercase tracking-wide flex items-center justify-center">
                        Clear
                    </button>
                    <button onClick={() => handlePinPress("0")} className="brutal-btn pin-btn bg-white hover:bg-gray-50 text-lg md:text-xl flex items-center justify-center">0</button>
                    <button onClick={handlePinBackspace} className="brutal-btn pin-btn bg-[#fb7185] hover:bg-[#f43f5e] text-white text-base md:text-lg flex items-center justify-center">
                        <i className="fas fa-backspace"></i>
                    </button>
                </div>

                <button onClick={onCancel} className="mt-3 md:mt-5 text-gray-500 hover:text-[#060606] font-bold flex items-center gap-2 px-4 py-2 transition-colors lg:hidden shrink-0 text-sm">
                    <i className="fas fa-arrow-left"></i> Back to Names
                </button>
            </div>
        );

        const PersonalDashboard = ({
            personalData,
            startEdit,
            isFetchingLogs,
            actionAlertPlan,
            onClockAction,
            canClockIn,
            canClockOut,
            isSubmittingAction,
            roleLabel = '',
        }) => {
            const visibleData = filterTimesheetRowsUpToToday(personalData);

            return (
                <div className="section-width flex flex-col h-full animate-fade-in relative overflow-hidden">
                    <div className="content-safe-padding flex justify-between items-center mb-4 md:mb-6 shrink-0 pt-1">
                        <div>
                            {roleLabel && <div className="card-eyebrow text-[#38bdf8]">{roleLabel}</div>}
                            <h3 className={`section-title ${roleLabel ? 'mt-1' : ''}`}>My Timesheet</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            {isFetchingLogs && <span className="card-meta text-[#38bdf8]"><i className="fas fa-sync fa-spin mr-1"></i>Syncing...</span>}
                        </div>
                    </div>

                    {actionAlertPlan && (
                        <div className="content-safe-padding mb-4">
                            <div className="section-card panel-content-card bg-[#fee2e2]">
                                <div className="flex items-start gap-3">
                                    <i className="fas fa-shield-alt text-[#dc2626] text-lg mt-0.5"></i>
                                    <p className="text-xs md:text-sm font-bold text-[#060606] leading-relaxed">{actionAlertPlan.message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="content-safe-padding grid grid-cols-2 gap-3 mb-4 md:mb-5 shrink-0">
                        <button
                            onClick={() => onClockAction("CLOCK_IN")}
                            disabled={!canClockIn}
                            className={`brutal-btn timesheet-action-button flex flex-col items-center justify-center ${
                                !canClockIn ? 'bg-gray-200 text-gray-500' : 'bg-[#4ade80] hover:bg-[#22c55e]'
                            }`}
                        >
                            <i className={`fas ${isSubmittingAction ? 'fa-circle-notch spinner' : 'fa-sign-in-alt'}`}></i>
                            <span>{isSubmittingAction ? 'Saving...' : 'Clock In'}</span>
                        </button>
                        <button
                            onClick={() => onClockAction("CLOCK_OUT")}
                            disabled={!canClockOut}
                            className={`brutal-btn timesheet-action-button flex flex-col items-center justify-center ${
                                !canClockOut ? 'bg-gray-200 text-gray-500' : 'bg-[#fb7185] hover:bg-[#f43f5e]'
                            }`}
                        >
                            <i className={`fas ${isSubmittingAction ? 'fa-circle-notch spinner' : 'fa-sign-out-alt'}`}></i>
                            <span>{isSubmittingAction ? 'Saving...' : 'Clock Out'}</span>
                        </button>
                    </div>
                    
                    <div className="content-safe-padding flex-1 overflow-y-auto no-scrollbar space-y-2 pb-4 pt-1">
                        {visibleData.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 font-bold text-sm md:text-lg border-2 border-dashed border-gray-300 rounded-xl">No records found</div>
                        ) : (
                            visibleData.map((row, idx) => {
                                const dateObj = parseLocalDate(row.date);
                                const dayName = isNaN(dateObj) ? '???' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                                const dayNum = isNaN(dateObj) ? '??' : dateObj.getDate();
                                const monthName = isNaN(dateObj) ? '???' : dateObj.toLocaleDateString('en-US', { month: 'short' });
                                const isLocked = isEntryLocked(row);
                                const hasEdits = parseReasonCell(row.reason).length > 0;

                                return (
                                    <div key={idx} className={`timesheet-entry-row panel-row-surface flex flex-row ${isLocked ? 'bg-gray-50 opacity-80' : 'bg-white'}`}>
                                        
                                        {/* Date Block (Lavender) */}
                                        <div className={`timesheet-entry-date-block flex flex-row items-center justify-center border-r-2 border-black shrink-0 ${isLocked ? 'bg-gray-200' : 'bg-[#e9d5ff]'}`}>
                                            <div className="timesheet-entry-day font-bold font-poppins text-[#060606]">{dayName}</div>
                                            <div className="timesheet-entry-number font-bold font-poppins text-[#060606]">{dayNum}</div>
                                            <div className="timesheet-entry-month font-bold text-[#060606]">{monthName}</div>
                                        </div>

                                        {/* Shift Details Block */}
                                        <div className="timesheet-entry-details flex-1 flex flex-col md:flex-row md:items-center justify-between relative">
                                            <div className="timesheet-entry-grid flex-1 grid grid-cols-2 md:grid-cols-3">
                                                <div className="flex flex-col">
                                                    <span className="timesheet-entry-label font-bold text-gray-500 uppercase">In</span>
                                                    <span className={`timesheet-entry-value font-bold font-poppins ${isLocked ? 'text-gray-600' : 'text-[#10b981]'}`}>{row.timeIn}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="timesheet-entry-label font-bold text-gray-500 uppercase">Out</span>
                                                    <span className={`timesheet-entry-value font-bold font-poppins ${isLocked ? 'text-gray-600' : 'text-[#f43f5e]'}`}>{row.timeOut || '-'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="timesheet-entry-label font-bold text-gray-500 uppercase">Total</span>
                                                    <span className="timesheet-entry-value font-bold font-poppins text-[#060606]">{calculateHours(row.timeIn, row.timeOut)}</span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="absolute top-2 right-2 md:static md:flex items-center justify-center shrink-0">
                                                {isLocked ? (
                                                    <span className="text-gray-400 p-2 flex items-center justify-center" title="Pay period locked">
                                                        <i className="fas fa-lock text-sm md:text-lg"></i>
                                                    </span>
                                                ) : (
                                                    <div className="relative">
                                                        <button onClick={() => startEdit(row)} className="brutal-btn timesheet-edit-button bg-[#fde047] flex items-center justify-center hover:bg-[#facc15]" title="Edit Time">
                                                            <i className="fas fa-pencil-alt"></i>
                                                        </button>
                                                        {hasEdits && (
                                                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-[#f43f5e] border-2 border-black rounded-full" title="Entry has notes/edits"></div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                </div>
            );
        };

        const EditForm = ({ editTarget, editForm, setEditForm, saveEdit, reasonValidationTriggered, onPrev, onNext, canPrev, canNext, onClose, isSubmitting }) => {
            const historyRows = parseReasonCell(editForm.oldReason);
            const isReasonInvalid = reasonValidationTriggered && !editForm.newReason.trim();

            return (
            <div className="h-full flex flex-col animate-fade-in overflow-hidden relative">
                <div className="p-4 md:p-6 border-b-3 border-black flex flex-col md:flex-row justify-between items-center bg-[#fde047] gap-4 mb-4 md:mb-6 shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold font-poppins text-[#060606] text-center md:text-left">Edit Entry</h3>
                    </div>

                    <div className="flex items-center gap-4 bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_#000000]">
                        <button onClick={onPrev} disabled={!canPrev} className={`w-10 h-10 flex items-center justify-center rounded-lg text-[#060606] transition-colors font-bold font-poppins text-lg ${canPrev ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'}`}>
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <span className="font-bold font-poppins text-[#060606] w-24 text-center text-lg">
                            {formatMonthDayDate(editTarget.date)}
                        </span>
                        <button onClick={onNext} disabled={!canNext} className={`w-10 h-10 flex items-center justify-center rounded-lg text-[#060606] transition-colors font-bold font-poppins text-lg ${canNext ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'}`}>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <button onClick={onClose} className="brutal-btn w-12 h-12 bg-white flex items-center justify-center text-[#060606] hover:bg-gray-100 text-xl absolute md:relative top-4 right-4 md:top-auto md:right-auto">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Padding to prevent input shadow clipping */}
                <div className="space-y-3 md:space-y-4 flex-1 overflow-y-auto no-scrollbar pb-4 pt-1 px-4 md:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div>
                            <label className="block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-1 md:mb-2">Time In</label>
                            <div className="w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-stretch focus-within:shadow-[4px_4px_0px_0px_#000000]">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="8:00"
                                    value={editForm.timeIn}
                                    onChange={e => {
                                        const next = normalizeTimeInputWithPeriod(e.target.value, editForm.timeInPeriod);
                                        setEditForm({ ...editForm, timeIn: next.time, timeInPeriod: next.period });
                                    }}
                                    className="flex-1 px-2.5 md:px-3 py-2.5 md:py-3 font-bold text-sm md:text-base bg-transparent outline-none"
                                    maxLength={5}
                                />
                                <div className="flex shrink-0 items-center gap-2 pr-2 md:pr-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, timeInPeriod: 'AM' })}
                                        className={`text-xs md:text-sm font-bold transition-colors ${
                                            editForm.timeInPeriod === 'AM'
                                                ? 'text-[#060606]'
                                                : 'text-gray-400 hover:text-gray-500'
                                        }`}
                                    >
                                        AM
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, timeInPeriod: 'PM' })}
                                        className={`text-xs md:text-sm font-bold transition-colors ${
                                            editForm.timeInPeriod === 'PM'
                                                ? 'text-[#060606]'
                                                : 'text-gray-400 hover:text-gray-500'
                                        }`}
                                    >
                                        PM
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-bold font-poppins text-[#060606] mb-1 md:mb-2">Time Out</label>
                            <div className="w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-stretch focus-within:shadow-[4px_4px_0px_0px_#000000]">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="5:00"
                                    value={editForm.timeOut}
                                    onChange={e => {
                                        const next = normalizeTimeInputWithPeriod(e.target.value, editForm.timeOutPeriod);
                                        setEditForm({ ...editForm, timeOut: next.time, timeOutPeriod: next.period });
                                    }}
                                    className="flex-1 px-2.5 md:px-3 py-2.5 md:py-3 font-bold text-sm md:text-base bg-transparent outline-none"
                                    maxLength={5}
                                />
                                <div className="flex shrink-0 items-center gap-2 pr-2 md:pr-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, timeOutPeriod: 'AM' })}
                                        className={`text-xs md:text-sm font-bold transition-colors ${
                                            editForm.timeOutPeriod === 'AM'
                                                ? 'text-[#060606]'
                                                : 'text-gray-400 hover:text-gray-500'
                                        }`}
                                    >
                                        AM
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, timeOutPeriod: 'PM' })}
                                        className={`text-xs md:text-sm font-bold transition-colors ${
                                            editForm.timeOutPeriod === 'PM'
                                                ? 'text-[#060606]'
                                                : 'text-gray-400 hover:text-gray-500'
                                        }`}
                                    >
                                        PM
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="mb-3 md:mb-4">
                            <label className="flex items-center gap-2 text-xs md:text-sm font-bold font-poppins mb-1 md:mb-2 text-[#060606]">
                                <span className="w-2 h-2 bg-[#f43f5e] border border-black rounded-full"></span>
                                Previous Edits
                            </label>
                            <div className="w-full p-3 md:p-4 border-2 border-black rounded-xl bg-gray-100 text-[#060606] font-bold text-xs md:text-sm min-h-[84px] max-h-[132px] overflow-y-auto no-scrollbar">
                                {historyRows.length > 0 ? (
                                    <div className="space-y-2">
                                        {historyRows.map((entry, idx) => (
                                            <div key={`${entry.timestamp}-${idx}`} className="leading-snug break-words">
                                                {entry.timestamp ? `${entry.timestamp}` : ''}
                                                {entry.timestamp && entry.editor ? ' | ' : ''}
                                                {entry.editor ? `${entry.editor}: ` : (entry.timestamp ? ': ' : '')}
                                                {entry.note || '-'}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 italic">No previous edits</div>
                                )}
                            </div>
                        </div>

                        <label className={`block text-xs md:text-sm font-bold font-poppins mb-1 md:mb-2 ${isReasonInvalid ? 'text-[#e11d48]' : 'text-[#060606]'}`}>Reason for Edit (Required)</label>
                        <textarea 
                            value={editForm.newReason}
                            onChange={e => setEditForm({...editForm, newReason: e.target.value})}
                            className={`w-full p-3 md:p-4 font-bold text-sm md:text-base h-20 md:h-28 border-2 rounded-xl outline-none transition-colors placeholder:text-gray-400 ${
                                isReasonInvalid
                                    ? 'border-[#f43f5e] bg-white text-[#060606]'
                                    : 'border-black bg-white text-[#060606]'
                            }`}
                            placeholder="E.g., Forgot to clock in, System error..."
                        ></textarea>
                    </div>
                </div>

                <div className="mt-2 md:mt-4 shrink-0 px-4 md:px-6 pb-4 md:pb-6">
                    <button onClick={saveEdit} disabled={isSubmitting} className="brutal-btn w-full bg-[#38bdf8] hover:bg-[#0ea5e9] py-2.5 md:py-3 text-sm md:text-base text-[#060606]">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                </div>
            );
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
                setDrafts(prev => ({
                    ...prev,
                    [rowNumber]: {
                        ...(prev[rowNumber] || {}),
                        [field]: value,
                    }
                }));
            };

            const clearDraft = (rowNumber, field) => {
                setDrafts(prev => ({
                    ...prev,
                    [rowNumber]: {
                        ...(prev[rowNumber] || {}),
                        [field]: '',
                    }
                }));
            };

            const submitAction = async (row, field, submitter) => {
                const quantity = parseWholeNumber(drafts[row.rowNumber]?.[field]);
                if (!quantity) {
                    onMessage?.({ type: 'error', message: "Enter a whole number before saving inventory progress." });
                    return;
                }

                const didSucceed = await submitter(row, quantity);
                if (didSucceed) {
                    clearDraft(row.rowNumber, field);
                }
            };

            return (
                <div className="section-width flex flex-col h-full animate-fade-in overflow-hidden">
                    <div className="content-safe-padding flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 md:mb-6 shrink-0 pt-1 pb-1">
                        <div>
                            <h3 className="section-title">Inventory Board</h3>
                            <p className="section-subtitle mt-1">Start work here, then move finished pieces into Awaiting Approval.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 self-start md:self-auto">
                            <button
                                onClick={onRefresh}
                                disabled={isFetchingInventory || isSubmittingInventory}
                                className="brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
                            >
                                <i className={`fas ${isFetchingInventory ? 'fa-circle-notch spinner' : 'fa-rotate-right'} text-[#38bdf8]`}></i>
                                <span>{isFetchingInventory ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4 pr-1">
                        {openRows.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 font-bold text-sm md:text-lg border-2 border-dashed border-gray-300 rounded-xl bg-white">
                                No active inventory needs right now.
                            </div>
                        ) : openRows.map(row => (
                            <div key={row.rowNumber} className="section-card panel-content-card">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="inventory-card-header">
                                            <div className="inventory-card-meta-block shrink-0 md:basis-[150px]">
                                                <div className="inventory-card-label">SKU</div>
                                                <div className="inventory-card-sku mt-1">{getInventorySkuText(row)}</div>
                                            </div>
                                            <div className="inventory-card-meta-block min-w-0 flex-1">
                                                <div className="inventory-card-label">Pen Name</div>
                                                <h4 className="inventory-card-name mt-1">{getInventoryNameText(row)}</h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center rounded-full border-2 border-black bg-[#fef3c7] px-3 py-1 text-xs font-bold uppercase tracking-wide">
                                        {row.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
                                    <div className="rounded-xl border-2 border-black bg-[#f5f3ff] px-3 py-2">
                                        <div className="inventory-stat-label">Needed</div>
                                        <div className="inventory-stat-value text-lg">{row.needed}</div>
                                    </div>
                                    <div className="rounded-xl border-2 border-black bg-[#ecfccb] px-3 py-2">
                                        <div className="inventory-stat-label">In Process</div>
                                        <div className="inventory-stat-value text-lg">{row.inProcess}</div>
                                    </div>
                                    <div className="rounded-xl border-2 border-black bg-[#fef3c7] px-3 py-2">
                                        <div className="inventory-stat-label">Awaiting Approval</div>
                                        <div className="inventory-stat-value text-lg">{row.awaitingApproval}</div>
                                    </div>
                                    <div className="rounded-xl border-2 border-black bg-[#d1fae5] px-3 py-2">
                                        <div className="inventory-stat-label">Approved</div>
                                        <div className="inventory-stat-value text-lg">{row.addedToStore}</div>
                                    </div>
                                    <div className="rounded-xl border-2 border-black bg-[#fee2e2] px-3 py-2">
                                        <div className="inventory-stat-label">Still Needed</div>
                                        <div className="inventory-stat-value text-lg">{row.stillNeeded}</div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3 mt-4">
                                    <div className="rounded-xl border-2 border-black bg-[#f0fdf4] p-3">
                                        <label className="block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2">Start Qty</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={drafts[row.rowNumber]?.start || ''}
                                                onChange={e => updateDraft(row.rowNumber, 'start', e.target.value)}
                                                className="brutal-input w-full px-3 py-2 text-sm"
                                                placeholder={row.stillNeeded > 0 ? `${row.stillNeeded} left` : 'All covered'}
                                            />
                                            <button
                                                onClick={() => submitAction(row, 'start', onStart)}
                                                disabled={isSubmittingInventory || row.stillNeeded <= 0}
                                                className="brutal-btn action-button action-button-fixed action-button-iconless bg-[#4ade80] hover:bg-[#22c55e]"
                                            >
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border-2 border-black bg-[#fff7ed] p-3">
                                        <label className="block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2">Finish Qty</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={drafts[row.rowNumber]?.finish || ''}
                                                onChange={e => updateDraft(row.rowNumber, 'finish', e.target.value)}
                                                className="brutal-input w-full px-3 py-2 text-sm"
                                                placeholder={row.inProcess > 0 ? `${row.inProcess} in process` : 'Nothing started'}
                                            />
                                            <button
                                                onClick={() => submitAction(row, 'finish', onFinish)}
                                                disabled={isSubmittingInventory || row.inProcess <= 0}
                                                className="brutal-btn action-button action-button-fixed action-button-iconless bg-[#fb923c] hover:bg-[#f97316]"
                                            >
                                                Finish
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    Updated {formatInventoryTimestamp(row.lastUpdated)}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            );
        };

        const PublishedSchedulePanel = ({
            sheetData,
            eyebrow = '',
            title = 'Published Schedule',
            subtitle = '',
            highlightName = '',
            compact = false,
            weekCount = 3,
            allowTimeOffRequests = false,
            onSelectDate = null,
            isSubmittingTimeOff = false,
        }) => {
            const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStartDate(new Date()));
            const allRows = Array.isArray(sheetData) ? sheetData : [];
            const publishedRows = allRows
                .filter(row => !isTimeOffRow(row) && (hasTimeValue(row.schedIn) || hasTimeValue(row.schedOut)) && isPublishedSchedule(row))
                .slice()
                .sort((a, b) => {
                    const dateCompare = normalizeDate(a.date).localeCompare(normalizeDate(b.date));
                    if (dateCompare !== 0) return dateCompare;
                    const timeCompare = (parseClockTimeToMinutes(a.schedIn) || 0) - (parseClockTimeToMinutes(b.schedIn) || 0);
                    if (timeCompare !== 0) return timeCompare;
                    return String(a.name || '').localeCompare(String(b.name || ''));
                });
            const normalizedHighlightName = String(highlightName || '').trim();
            const showTimeOffRequestHint = Boolean(allowTimeOffRequests && normalizedHighlightName && onSelectDate);
            const weeksToShow = compact ? Math.min(2, weekCount) : weekCount;
            const visibleWeeks = Array.from({ length: weeksToShow }).map((_, weekIndex) => {
                const startDate = addDaysToLocalDate(currentWeekStart, weekIndex * 7);
                const days = buildWeekDays(startDate);
                const weekStartKey = normalizeDate(startDate);
                const weekEndKey = normalizeDate(days[6]);
                const shiftCount = publishedRows.filter(row => {
                    const rowKey = normalizeDate(row.date);
                    return rowKey >= weekStartKey && rowKey <= weekEndKey;
                }).length;

                return {
                    startDate,
                    days,
                    shiftCount,
                };
            });

            return (
                <div className="section-width flex flex-col h-full animate-fade-in overflow-hidden">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-4 shrink-0 px-1 pt-1">
                        <div>
                            {eyebrow && <div className="card-eyebrow text-[#38bdf8]">{eyebrow}</div>}
                            <h3 className={`section-title ${eyebrow ? 'mt-1' : ''}`}>{title}</h3>
                            {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_#000000] h-12">
                                <button onClick={() => setCurrentWeekStart(prev => addDaysToLocalDate(prev, -7))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#060606] transition-colors font-bold font-poppins text-lg">
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <span className="font-bold font-poppins text-[#060606] min-w-[170px] md:min-w-[210px] text-center text-sm md:text-base px-2">
                                    {formatWeekRangeLabel(currentWeekStart)}
                                </span>
                                <button onClick={() => setCurrentWeekStart(prev => addDaysToLocalDate(prev, 7))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#060606] transition-colors font-bold font-poppins text-lg">
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar px-1 pb-4">
                        <div className="space-y-4">
                            {visibleWeeks.map((week, weekIndex) => (
                                <div key={normalizeDate(week.startDate)} className="section-card panel-content-card bg-[#fffdf5]">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                        <div>
                                            <div className="card-eyebrow text-[#38bdf8]">Week {weekIndex + 1}</div>
                                            <h4 className="card-title mt-1">{formatWeekRangeLabel(week.startDate)}</h4>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <div className="card-meta">
                                                {week.shiftCount} published shift{week.shiftCount === 1 ? '' : 's'}
                                            </div>
                                            {showTimeOffRequestHint && (
                                                <div className="card-meta mt-1 text-[#38bdf8]">
                                                    Tap the date to request time off.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="schedule-week-grid employee-schedule-grid">
                                        {week.days.map(dayObj => {
                                            const dayKey = normalizeDate(dayObj);
                                            const dayShifts = publishedRows.filter(row => normalizeDate(row.date) === dayKey);
                                            const isToday = dayKey === normalizeDate(new Date());
                                            const timeOffRow = normalizedHighlightName
                                                ? getTimeOffRowForEmployeeDate(allRows, normalizedHighlightName, dayKey)
                                                : null;
                                            const timeOffMeta = parseTimeOffMetadata(timeOffRow?.reason);
                                            const personalShift = normalizedHighlightName
                                                ? dayShifts.find(shift => String(shift.name || '').trim() === normalizedHighlightName)
                                                : null;
                                            const canSelectDate = Boolean(
                                                allowTimeOffRequests &&
                                                normalizedHighlightName &&
                                                onSelectDate &&
                                                (!isPastScheduleDate(dayKey) || timeOffRow)
                                            );
                                            const shouldShowPersonalCard = Boolean(timeOffRow || personalShift);
                                            const personalCardClass = timeOffRow
                                                ? (isApprovedTimeOffRow(timeOffRow) ? 'bg-[#fee2e2]' : 'bg-[#fff7ed]')
                                                : personalShift
                                                    ? 'bg-[#dbeafe]'
                                                    : 'bg-[#f8fafc]';
                                            const personalCardTitle = timeOffRow
                                                ? getTimeOffStatusLabel(timeOffRow)
                                                : 'Your shift';
                                            const personalCardValue = timeOffRow
                                                ? getTimeOffRangeLabel(timeOffRow, timeOffMeta)
                                                : (personalShift ? `${personalShift.schedIn} - ${personalShift.schedOut}` : '');
                                            return (
                                                <div
                                                    key={dayKey}
                                                    className={`section-card employee-schedule-day-card overflow-hidden ${isToday ? 'bg-[#e0f2fe]' : 'bg-white'}`}
                                                >
                                                    {allowTimeOffRequests ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => canSelectDate && onSelectDate(dayKey)}
                                                            disabled={!canSelectDate}
                                                            className={`w-full px-4 py-3 border-b-2 border-black text-left ${isToday ? 'bg-[#38bdf8]' : 'bg-[#f8fafc]'} ${canSelectDate ? 'hover:bg-[#dbeafe]' : 'cursor-default'}`}
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="card-eyebrow text-[#060606]">
                                                                    {dayObj.toLocaleDateString('en-US', { weekday: 'short' })}
                                                                </div>
                                                                <div className="card-title mt-1 whitespace-nowrap">{formatShortDateLabel(dayObj)}</div>
                                                            </div>
                                                        </button>
                                                    ) : (
                                                        <div className={`px-4 py-3 border-b-2 border-black ${isToday ? 'bg-[#38bdf8]' : 'bg-[#f8fafc]'}`}>
                                                            <div className="card-eyebrow text-[#060606]">
                                                                {dayObj.toLocaleDateString('en-US', { weekday: 'short' })}
                                                            </div>
                                                            <div className="card-title mt-1 whitespace-nowrap">{formatShortDateLabel(dayObj)}</div>
                                                        </div>
                                                    )}
                                                    <div className="employee-schedule-shifts no-scrollbar p-3 space-y-2">
                                                        {normalizedHighlightName && shouldShowPersonalCard && (
                                                            <div className={`schedule-shift-card px-2.5 py-2.5 ${personalCardClass}`}>
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="card-title text-sm leading-tight">{personalCardTitle}</div>
                                                                    {timeOffRow ? (
                                                                        <span className={`status-chip px-2 py-1 text-[10px] ${isApprovedTimeOffRow(timeOffRow) ? 'bg-[#fecaca]' : 'bg-[#fde68a]'}`}>
                                                                            {getTimeOffStatusLabel(timeOffRow)}
                                                                        </span>
                                                                    ) : personalShift ? (
                                                                        <span className="status-chip bg-[#e0f2fe] px-2 py-1 text-[10px]">You</span>
                                                                    ) : null}
                                                                </div>
                                                                <div className="card-meta employee-shift-time mt-1.5 text-[#060606]">
                                                                    {personalCardValue}
                                                                </div>
                                                                {timeOffRow && timeOffMeta?.approvedBy && (
                                                                    <div className="card-meta mt-1">
                                                                        Approved by {timeOffMeta.approvedBy}
                                                                    </div>
                                                                )}
                                                                {timeOffRow && !timeOffMeta?.approvedBy && timeOffMeta?.requestedAt && (
                                                                    <div className="card-meta mt-1">
                                                                        Requested {formatHistoryTimestamp(timeOffMeta.requestedAt)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {!shouldShowPersonalCard && dayShifts.length === 0 && (
                                                            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white px-3 py-5 text-center text-xs font-bold text-gray-400">
                                                                No published shifts.
                                                            </div>
                                                        )}
                                                        {dayShifts.length > 0 ? dayShifts.map((shift, index) => {
                                                            const isHighlighted = normalizedHighlightName && String(shift.name || '').trim() === normalizedHighlightName;
                                                            return (
                                                                <div
                                                                    key={`${dayKey}-${shift.name}-${index}`}
                                                                    className={`schedule-shift-card px-2.5 py-2.5 ${isHighlighted ? 'bg-[#dbeafe]' : 'bg-white'}`}
                                                                >
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="card-title text-sm leading-tight">{shift.name}</div>
                                                                        {isHighlighted && (
                                                                            <span className="status-chip bg-[#e0f2fe] px-2 py-1 text-[10px]">You</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="card-meta employee-shift-time mt-1.5">
                                                                        {shift.schedIn} - {shift.schedOut}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }) : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        };

        const EmployeeTimeOffModal = ({
            employeeName,
            draft,
            setDraft,
            existingRow,
            onClose,
            onSubmit,
            isSubmitting,
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

            return (
                <div className="editor-modal-backdrop" onClick={onClose}>
                    <div className="brutal-card editor-modal bg-white p-4 md:p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h4 className="section-title">Time Off Request</h4>
                                <p className="section-subtitle mt-1">
                                    {employeeName} - {formatFullDate(draft.date)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="brutal-btn bg-white px-4 py-2 text-sm md:text-base flex items-center gap-2 self-start"
                            >
                                <i className="fas fa-xmark"></i>
                                <span>Close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            <div className="section-card bg-[#f8fafc] px-4 py-3">
                                <div className="card-eyebrow">Requested Block</div>
                                <div className="card-title mt-2">{formattedRange || 'Choose full day or hours'}</div>
                            </div>
                            <div className="section-card bg-[#f8fafc] px-4 py-3">
                                <div className="card-eyebrow">Status</div>
                                <div className="card-title mt-2">
                                    {isApproved ? 'Approved' : isPending ? 'Pending approval' : 'Not submitted yet'}
                                </div>
                                {existingMeta?.approvedBy && (
                                    <div className="card-meta mt-1">Approved by {existingMeta.approvedBy}</div>
                                )}
                            </div>
                        </div>

                        <div className="section-card bg-white p-4 mt-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <h5 className="card-title">Request Details</h5>
                                    <p className="section-subtitle mt-1">
                                        {isApproved
                                            ? 'This request is already approved. An admin will need to clear it before it can be changed.'
                                            : 'Choose a full day or enter the specific hours you need blocked out.'}
                                    </p>
                                </div>
                                {existingRow && (
                                    <div className={`status-chip ${isApproved ? 'bg-[#fecaca]' : 'bg-[#fde68a]'}`}>
                                        {getTimeOffStatusLabel(existingRow)}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button
                                    type="button"
                                    disabled={isApproved}
                                    onClick={() => setDraft(prev => ({ ...prev, fullDay: true }))}
                                    className={`brutal-btn px-4 py-3 text-sm md:text-base ${draft.fullDay ? 'bg-[#38bdf8]' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    Full Day
                                </button>
                                <button
                                    type="button"
                                    disabled={isApproved}
                                    onClick={() => setDraft(prev => ({ ...prev, fullDay: false }))}
                                    className={`brutal-btn px-4 py-3 text-sm md:text-base ${!draft.fullDay ? 'bg-[#38bdf8]' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    Specific Hours
                                </button>
                            </div>

                            {!draft.fullDay && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end mt-4">
                                    <div>
                                        <label className="field-label block mb-2">Block Starting</label>
                                        <div className="w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-center gap-3 px-3 focus-within:shadow-[4px_4px_0px_0px_#000000] transition-shadow">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="9:00"
                                                value={draft.schedIn}
                                                onChange={e => {
                                                    const next = normalizeTimeInputWithPeriod(e.target.value, draft.schedInPeriod);
                                                    setDraft(prev => ({
                                                        ...prev,
                                                        schedIn: next.time,
                                                        schedInPeriod: next.period,
                                                    }));
                                                }}
                                                disabled={isApproved}
                                                className="w-[5ch] min-w-[5ch] py-3 font-bold text-sm md:text-base bg-transparent outline-none disabled:opacity-50"
                                                maxLength={5}
                                            />
                                            <div className="ml-auto flex shrink-0 items-center gap-2">
                                                <button type="button" disabled={isApproved} onClick={() => setDraft(prev => ({ ...prev, schedInPeriod: 'AM' }))} className={`text-xs md:text-sm font-bold ${draft.schedInPeriod === 'AM' ? 'text-[#060606]' : 'text-gray-400 hover:text-gray-500'}`}>AM</button>
                                                <button type="button" disabled={isApproved} onClick={() => setDraft(prev => ({ ...prev, schedInPeriod: 'PM' }))} className={`text-xs md:text-sm font-bold ${draft.schedInPeriod === 'PM' ? 'text-[#060606]' : 'text-gray-400 hover:text-gray-500'}`}>PM</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="field-label block mb-2">Block Ending</label>
                                        <div className="w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-center gap-3 px-3 focus-within:shadow-[4px_4px_0px_0px_#000000] transition-shadow">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="5:00"
                                                value={draft.schedOut}
                                                onChange={e => {
                                                    const next = normalizeTimeInputWithPeriod(e.target.value, draft.schedOutPeriod);
                                                    setDraft(prev => ({
                                                        ...prev,
                                                        schedOut: next.time,
                                                        schedOutPeriod: next.period,
                                                    }));
                                                }}
                                                disabled={isApproved}
                                                className="w-[5ch] min-w-[5ch] py-3 font-bold text-sm md:text-base bg-transparent outline-none disabled:opacity-50"
                                                maxLength={5}
                                            />
                                            <div className="ml-auto flex shrink-0 items-center gap-2">
                                                <button type="button" disabled={isApproved} onClick={() => setDraft(prev => ({ ...prev, schedOutPeriod: 'AM' }))} className={`text-xs md:text-sm font-bold ${draft.schedOutPeriod === 'AM' ? 'text-[#060606]' : 'text-gray-400 hover:text-gray-500'}`}>AM</button>
                                                <button type="button" disabled={isApproved} onClick={() => setDraft(prev => ({ ...prev, schedOutPeriod: 'PM' }))} className={`text-xs md:text-sm font-bold ${draft.schedOutPeriod === 'PM' ? 'text-[#060606]' : 'text-gray-400 hover:text-gray-500'}`}>PM</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isPastDate && (
                                <p className="section-subtitle mt-3 text-[#e11d48]">
                                    Past dates canâ€™t be requested from this screen.
                                </p>
                            )}
                            {!draft.fullDay && !hasValidHours && !isApproved && (
                                <p className="section-subtitle mt-3 text-[#e11d48]">
                                    Enter a valid start and end time to request a partial-day block.
                                </p>
                            )}
                        </div>

                        <div className="mt-4 flex flex-col md:flex-row gap-3 md:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="brutal-btn bg-white px-4 py-3 text-sm md:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={submitDisabled}
                                className="brutal-btn bg-[#4ade80] hover:bg-[#22c55e] px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
                            >
                                <i className={`fas ${isSubmitting ? 'fa-circle-notch spinner' : 'fa-paper-plane'}`}></i>
                                <span>
                                    {isSubmitting
                                        ? 'Sending...'
                                        : isPending
                                            ? 'Update Request'
                                            : 'Submit Request'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        const TodaySchedulePanel = ({
            sheetData,
            eyebrow = '',
            title = 'Schedule',
            subtitle = '',
        }) => {
            const todayKey = normalizeDate(new Date());
            const todayShifts = getTodayPublishedShifts(sheetData);
            const scheduleColumnCount = Math.min(Math.max(todayShifts.length, 1), 4);
            const scheduleGridWidth = `${(scheduleColumnCount * STANDARD_SIZE_UNIT) + ((scheduleColumnCount - 1) * STANDARD_SIZE_GAP)}px`;

            return (
                <div className="section-width flex flex-col h-auto min-h-0 animate-fade-in">
                    <div className="flex items-start justify-between gap-3 mb-3 shrink-0">
                        <div>
                            {eyebrow && <div className="card-eyebrow text-[#38bdf8]">{eyebrow}</div>}
                            <h3 className={`section-title ${eyebrow ? 'mt-1' : ''}`}>{title}</h3>
                            {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
                        </div>
                        <div className="status-chip bg-[#e0f2fe] self-start">
                            {todayShifts.length} {todayShifts.length === 1 ? 'shift' : 'shifts'}
                        </div>
                    </div>

                    <div className="public-schedule-wrap shadow-safe-2" style={{ width: `min(100%, ${scheduleGridWidth})` }}>
                        {todayShifts.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400">
                                No published shifts.
                            </div>
                        ) : (
                            <div
                                className="public-schedule-grid"
                                style={{ width: `min(100%, ${scheduleGridWidth})` }}
                            >
                                {todayShifts.map((shift, idx) => (
                                    <div
                                        key={`${todayKey}-${shift.name}-${idx}`}
                                        className="public-schedule-shift-card flex flex-col gap-2"
                                    >
                                        <div className="min-w-0">
                                            <div className="public-schedule-name" title={shift.name}>
                                                {shift.name}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="public-schedule-time-pill">
                                                {shift.schedIn} - {shift.schedOut}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        const InventorySnapshotPanel = ({
            inventoryRows,
            eyebrow = '',
            title = 'Inventory Snapshot',
            subtitle = '',
        }) => {
            const { openRows, totals } = buildInventorySnapshotSummary(inventoryRows);
            const inventorySubtitle = subtitle || 'Active needs grouped into one quick summary.';

            return (
                <div className="section-width flex flex-col h-auto min-h-0 animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 shrink-0">
                        <div>
                            {eyebrow && <div className="card-eyebrow text-[#f97316]">{eyebrow}</div>}
                            <h3 className={`section-title ${eyebrow ? 'mt-1' : ''}`}>{title}</h3>
                            <p className="section-subtitle mt-1">{inventorySubtitle}</p>
                        </div>
                        <div className="status-chip bg-[#fef3c7] self-start md:self-auto">
                            {openRows.length} open
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 mb-3 shrink-0">
                        <div className="public-summary-row bg-[#f0fdf4]">
                            <div className="text-[9px] uppercase font-bold text-gray-500">Still Needed</div>
                            <div className="font-bold font-poppins text-lg text-[#060606] mt-1">{totals.stillNeeded}</div>
                        </div>
                        <div className="public-summary-row bg-[#ecfccb]">
                            <div className="text-[9px] uppercase font-bold text-gray-500">In Process</div>
                            <div className="font-bold font-poppins text-lg text-[#060606] mt-1">{totals.inProcess}</div>
                        </div>
                        <div className="public-summary-row bg-[#fff7ed]">
                            <div className="text-[9px] uppercase font-bold text-gray-500">Awaiting</div>
                            <div className="font-bold font-poppins text-lg text-[#060606] mt-1">{totals.awaitingApproval}</div>
                        </div>
                    </div>

                    <div className="message-thread-scroll-auto no-scrollbar shadow-safe-2">
                        {openRows.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400 bg-white">
                                No open inventory tasks right now.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {openRows.map(row => (
                                    <div key={row.rowNumber} className="public-summary-row flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="inventory-card-sku" title={getInventorySkuText(row)}>
                                                {getInventorySkuText(row)}
                                            </div>
                                            <div className="font-bold font-poppins text-[#060606] text-sm leading-tight mt-1 break-words">
                                                {getInventoryNameText(row)}
                                            </div>
                                            <div className="card-meta mt-2">
                                                Updated {formatInventoryTimestamp(row.lastUpdated)}
                                            </div>
                                        </div>
                                        <div className="inventory-status-chip shrink-0 rounded-full border-2 border-black bg-[#fef3c7] font-bold uppercase text-center text-[#060606]">
                                            {row.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        const PenHospitalOverviewPanel = ({
            penHospitalCases,
            eyebrow = '',
            title = 'Pen Hospital Overview',
            subtitle = '',
        }) => {
            const summary = buildPenHospitalSummary(penHospitalCases)
                .filter(section => section.key !== 'completed')
                .map(section => ({
                    ...section,
                    displayTitle: section.key === 'ready' ? 'Ready' : section.title,
                }));
            const activeCount = summary.reduce((sum, section) => sum + section.count, 0);
            const overviewSubtitle = subtitle || 'Repair queue counts by lane.';

            return (
                <div className="section-width flex flex-col h-auto min-h-0 animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 shrink-0">
                        <div>
                            {eyebrow && <div className="card-eyebrow text-[#0f766e]">{eyebrow}</div>}
                            <h3 className={`section-title ${eyebrow ? 'mt-1' : ''}`}>{title}</h3>
                            <p className="section-subtitle mt-1">{overviewSubtitle}</p>
                        </div>
                        <div className="status-chip bg-[#ccfbf1] self-start md:self-auto">
                            {activeCount} active
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                        {summary.map(section => (
                            <div key={section.key} className={`public-summary-row ${section.countClass}`}>
                                <div className="text-[9px] uppercase font-bold text-gray-500">{section.displayTitle}</div>
                                <div className="font-bold font-poppins text-lg text-[#060606] mt-1">{section.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        const MessageBoardPanel = ({
            messages,
            title = 'Messages',
            eyebrow = 'Message Board',
            subtitle = '',
            viewerName = '',
            viewerRole = '',
            draft = '',
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
            maxMessages = null,
        }) => {
            const threadEndRef = useRef(null);
            const threadScrollRef = useRef(null);
            const [activeReactionMessageRow, setActiveReactionMessageRow] = useState(null);
            const normalizedViewerName = String(viewerName || '').trim().toLowerCase();
            const safeMessages = Array.isArray(messages) ? messages : [];
            const displayedMessages = (newestFirst ? [...safeMessages].reverse() : safeMessages)
                .slice(0, maxMessages || undefined);
            const trimmedDraft = normalizeMessageText(draft);
            const canReact = !readOnly && Boolean(normalizedViewerName) && typeof onReact === 'function';

            useEffect(() => {
                if (newestFirst && threadScrollRef.current) {
                    threadScrollRef.current.scrollTop = 0;
                    return;
                }
                if (threadEndRef.current) {
                    threadEndRef.current.scrollIntoView({ block: 'end' });
                }
            }, [safeMessages.length, newestFirst]);

            useEffect(() => {
                if (!activeReactionMessageRow) return;
                const hasActiveMessage = safeMessages.some(message => message?.rowNumber === activeReactionMessageRow);
                if (!hasActiveMessage) {
                    setActiveReactionMessageRow(null);
                }
            }, [safeMessages, activeReactionMessageRow]);

            const toggleReactionPicker = (rowNumber) => {
                if (!canReact || !rowNumber) return;
                setActiveReactionMessageRow(prev => prev === rowNumber ? null : rowNumber);
            };

            const handleReactionKeyDown = (event, rowNumber) => {
                if (!canReact || !rowNumber) return;
                if (event.key === 'Enter' || event.key === ' ') {
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

            return (
                <div className={`section-width flex flex-col min-h-0 animate-fade-in ${autoHeight ? 'h-auto pr-0 pb-0' : 'h-full pr-2 pb-2'}`}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3 shrink-0 pr-1 pb-1">
                        <div>
                            {eyebrow && <div className="card-eyebrow text-[#ec4899]">{eyebrow}</div>}
                            <h3 className={`section-title ${eyebrow ? 'mt-1' : ''}`}>{title}</h3>
                            {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 self-start justify-end">
                            {!readOnly && onRefresh && (
                                <button
                                    type="button"
                                    onClick={onRefresh}
                                    disabled={isFetching || isSubmitting}
                                    className="brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
                                >
                                    <i className={`fas ${isFetching ? 'fa-circle-notch spinner' : 'fa-rotate-right'} text-[#ec4899]`}></i>
                                    <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div ref={threadScrollRef} className={`${autoHeight ? 'message-thread-scroll-auto' : 'message-thread-scroll'} no-scrollbar shadow-safe-2 ${autoHeight ? '' : 'pb-2'}`}>
                        {safeMessages.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400">
                                No notes yet.
                            </div>
                        ) : (
                            <div className={`message-thread ${autoHeight ? 'message-thread-auto' : ''}`}>
                                {displayedMessages.map((message, index) => {
                                    const senderName = String(message?.senderName || '').trim() || 'Unknown';
                                    const senderRole = normalizeMessageRole(message?.senderRole);
                                    const normalizedSenderName = senderName.toLowerCase();
                                    const isOwnMessage = Boolean(normalizedViewerName) && normalizedSenderName === normalizedViewerName;
                                    const reactions = sanitizeMessageReactions(message?.reactions);
                                    const reactionSummary = getMessageReactionSummary(reactions);
                                    const viewerReaction = getViewerMessageReaction(reactions, viewerName, viewerRole);
                                    const isReactionPickerOpen = canReact && activeReactionMessageRow === message?.rowNumber;
                                    const isReactionPending = reactingRowNumber === message?.rowNumber;
                                    const alignRight = isOwnMessage || (!normalizedViewerName && senderRole === 'admin');
                                    const bubbleTone = isOwnMessage
                                        ? 'message-bubble-own'
                                        : senderRole === 'admin'
                                            ? 'message-bubble-admin'
                                            : 'message-bubble-staff';

                                    return (
                                        <div
                                            key={`${message?.rowNumber || 'msg'}-${index}`}
                                            className={`message-row ${alignRight ? 'message-row-right' : 'message-row-left'}`}
                                        >
                                            <div
                                                className={`message-bubble ${bubbleTone} ${canReact && message?.rowNumber ? 'message-bubble-interactive' : ''} ${isReactionPickerOpen ? 'message-bubble-active' : ''}`}
                                                role={canReact && message?.rowNumber ? 'button' : undefined}
                                                tabIndex={canReact && message?.rowNumber ? 0 : undefined}
                                                onClick={() => toggleReactionPicker(message?.rowNumber)}
                                                onKeyDown={event => handleReactionKeyDown(event, message?.rowNumber)}
                                                aria-label={canReact && message?.rowNumber ? `React to message from ${senderName}` : undefined}
                                            >
                                                <div className="message-author mb-2">{senderName}</div>
                                                <div className="message-text">{message?.message || ''}</div>
                                                {reactionSummary.length > 0 && (
                                                    <div className="message-reaction-strip">
                                                        {reactionSummary.map(reaction => (
                                                            <div
                                                                key={`${message?.rowNumber || 'msg'}-${reaction.key}`}
                                                                className={`message-reaction-pill ${viewerReaction === reaction.key ? 'message-reaction-pill-active' : ''}`}
                                                                title={reaction.names.join(', ')}
                                                            >
                                                                <i className={`fas ${reaction.icon}`}></i>
                                                                <span>{reaction.count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {isReactionPickerOpen && (
                                                    <div className="message-reaction-picker">
                                                        {MESSAGE_REACTION_OPTIONS.map(option => {
                                                            const isSelected = viewerReaction === option.key;
                                                            return (
                                                                <button
                                                                    key={`${message?.rowNumber || 'msg'}-${option.key}`}
                                                                    type="button"
                                                                    onClick={event => handleReactionSelect(event, message, option.key)}
                                                                    disabled={isReactionPending}
                                                                    className={`message-reaction-button ${isSelected ? 'message-reaction-button-active' : ''}`}
                                                                    aria-label={option.label}
                                                                    title={option.label}
                                                                >
                                                                    <i className={`fas ${option.icon}`}></i>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                <div className="card-meta mt-3">
                                                    {formatMessageTimestamp(message?.timestamp, message?.isoTimestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={threadEndRef}></div>
                            </div>
                        )}
                    </div>

                    {!readOnly && canCompose && (
                        <div className="mt-3 pt-3 border-t-2 border-black/10 shrink-0">
                            <label className="field-label block mb-2">Leave A Note</label>
                            <textarea
                                value={draft}
                                onChange={e => onDraftChange?.(String(e.target.value || '').slice(0, MESSAGE_MAX_LENGTH))}
                                onKeyDown={e => {
                                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && trimmedDraft && !isSubmitting) {
                                        e.preventDefault();
                                        onSend?.();
                                    }
                                }}
                                rows={4}
                                maxLength={MESSAGE_MAX_LENGTH}
                                placeholder="Share a note about time off, inventory, supplies, or anything the admin team should see."
                                className="brutal-input w-full px-4 py-3 text-sm md:text-base resize-none"
                            />
                            <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pr-1 pb-1">
                                <div className="card-meta">
                                    {trimmedDraft.length}/{MESSAGE_MAX_LENGTH} characters. Press Ctrl+Enter to send.
                                </div>
                                <button
                                    type="button"
                                    onClick={onSend}
                                    disabled={isSubmitting || !trimmedDraft}
                                    className="brutal-btn bg-[#f9a8d4] hover:bg-[#f472b6] px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
                                >
                                    <i className={`fas ${isSubmitting ? 'fa-circle-notch spinner' : 'fa-paper-plane'}`}></i>
                                    <span>{isSubmitting ? 'Sending...' : 'Send Note'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        const PenHospitalCaseCard = ({
            caseRow,
            currentUser,
            isSubmitting = false,
            onUpdateStatus,
        }) => {
            const currentRole = currentUser?.role || 'employee';
            const currentStatus = normalizePenHospitalStatus(caseRow?.status);
            const penNames = String(caseRow?.penNames || '').trim();
            const diagnosis = String(caseRow?.diagnosis || caseRow?.diagnosisNotes || '').trim();
            const lastUpdatedLabel = caseRow?.lastUpdated || caseRow?.createdAt || '';
            const lastUpdatedIso = caseRow?.lastUpdatedIso || caseRow?.createdAtIso || '';
            const canEditStatuses = Boolean(currentUser && typeof onUpdateStatus === 'function');
            const availableStatuses = PEN_HOSPITAL_STATUS_OPTIONS.filter(option => canUserSetPenHospitalStatus(currentRole, option.value));

            return (
                <div className="section-card panel-content-card">
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#0f766e]">Customer</div>
                            <h4 className="text-lg md:text-xl font-bold font-poppins text-[#060606] mt-1 break-words">
                                {String(caseRow?.customerName || '').trim() || 'Unnamed customer'}
                            </h4>
                            <div className="text-sm font-bold text-gray-600 mt-2">
                                {formatPenHospitalExpectedLabel(caseRow)}
                            </div>
                        </div>
                        <div className={`inline-flex items-center rounded-full border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#060606] ${getPenHospitalStatusChipClasses(currentStatus)}`}>
                            {currentStatus}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                        <div className="rounded-xl border-2 border-black bg-[#f8fafc] px-3 py-3">
                            <div className="text-[10px] uppercase font-bold tracking-wide text-gray-500">Pen Names</div>
                            <div className="text-sm md:text-base font-bold font-poppins text-[#060606] mt-1 break-words">
                                {penNames || 'Pen names were not listed for this return.'}
                            </div>
                        </div>
                        <div className="rounded-xl border-2 border-black bg-[#f8fafc] px-3 py-3">
                            <div className="text-[10px] uppercase font-bold tracking-wide text-gray-500">Diagnosis</div>
                            <div className="text-sm md:text-base font-bold font-poppins text-[#060606] mt-1 break-words">
                                {diagnosis || 'Diagnosis was not listed for this return.'}
                            </div>
                        </div>
                    </div>

                    {lastUpdatedLabel && (
                        <div className="card-meta mt-3">
                            Updated {formatPenHospitalTimestamp(lastUpdatedLabel, lastUpdatedIso)}
                        </div>
                    )}

                    {canEditStatuses && availableStatuses.length > 0 && (
                        <div className="mt-3">
                            <div className="text-[10px] uppercase font-bold tracking-wide text-gray-500">Update Status</div>
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
                                {availableStatuses.map(option => {
                                    const isActive = currentStatus === option.value;
                                    return (
                                        <button
                                            key={`${caseRow?.rowNumber || 'case'}-${option.value}`}
                                            type="button"
                                            onClick={() => !isActive && onUpdateStatus?.(caseRow, option.value)}
                                            disabled={isSubmitting || isActive}
                                            className={`brutal-btn px-3 py-2 text-[11px] md:text-xs leading-tight ${
                                                isActive
                                                    ? `${getPenHospitalStatusChipClasses(option.value)} text-[#060606]`
                                                    : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        const PenHospitalBoard = ({
            penHospitalCases,
            currentUser,
            isSubmitting = false,
            onUpdateStatus,
            emptyMessage = 'No Pen Hospital cases yet.',
        }) => {
            const sortedCases = sortPenHospitalCases(penHospitalCases);
            const summary = buildPenHospitalSummary(sortedCases);

            if (sortedCases.length === 0) {
                return (
                    <div className="h-full min-h-[360px] rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm md:text-base font-bold text-gray-400 flex items-center justify-center">
                        {emptyMessage}
                    </div>
                );
            }

            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
                        {summary.map(section => (
                            <div key={section.key} className={`public-summary-row ${section.countClass}`}>
                                <div className="text-[9px] uppercase font-bold text-gray-500">{section.title}</div>
                                <div className="font-bold font-poppins text-lg text-[#060606] mt-1">{section.count}</div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {PEN_HOSPITAL_BOARD_SECTIONS.map(section => {
                            const sectionCases = sortedCases.filter(caseRow => getPenHospitalBoardKey(caseRow?.status) === section.key);
                            return (
                                <div key={section.key} className={`brutal-card ${section.cardClass} p-4 md:p-5`}>
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                                        <div>
                                            <h4 className="card-title">{section.title}</h4>
                                            <p className="section-subtitle mt-1">{section.subtitle}</p>
                                        </div>
                                        <div className={`status-chip self-start ${section.countClass}`}>
                                            {sectionCases.length} case{sectionCases.length === 1 ? '' : 's'}
                                        </div>
                                    </div>

                                    {sectionCases.length === 0 ? (
                                        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm font-bold text-gray-400">
                                            No cases in this lane.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {sectionCases.map(caseRow => (
                                                <PenHospitalCaseCard
                                                    key={caseRow.rowNumber}
                                                    caseRow={caseRow}
                                                    currentUser={currentUser}
                                                    isSubmitting={isSubmitting}
                                                    onUpdateStatus={onUpdateStatus}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        };

        const EmployeePenHospitalPanel = ({
            penHospitalCases,
            currentUser,
            isFetchingPenHospital,
            isSubmittingPenHospital,
            onRefresh,
            onUpdateStatus,
        }) => {
            return (
                <div className="section-width flex flex-col h-full animate-fade-in overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4 shrink-0">
                        <div>
                            <h3 className="section-title">Pen Hospital</h3>
                            <p className="section-subtitle mt-1">
                                Track inbound repairs, surgery status, and what is ready to head back to the customer.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={onRefresh}
                                disabled={isFetchingPenHospital || isSubmittingPenHospital}
                                className="brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
                            >
                                <i className={`fas ${isFetchingPenHospital ? 'fa-circle-notch spinner' : 'fa-rotate-right'} text-[#0f766e]`}></i>
                                <span>{isFetchingPenHospital ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-4">
                        <PenHospitalBoard
                            penHospitalCases={penHospitalCases}
                            currentUser={currentUser}
                            isSubmitting={isSubmittingPenHospital}
                            onUpdateStatus={onUpdateStatus}
                            emptyMessage="No Pen Hospital cases are active yet."
                        />
                    </div>
                </div>
            );
        };

        const AdminPenHospitalWorkspace = ({
            adminUser,
            penHospitalCases,
            isFetchingPenHospital,
            isSubmittingPenHospital,
            onRefresh,
            onCreateCase,
            onUpdateStatus,
            onMessage,
        }) => {
            const [createForm, setCreateForm] = useState({
                customerName: '',
                expectedCount: '',
                diagnosis: '',
                penNames: '',
            });

            const submitCreate = async () => {
                const customerName = String(createForm.customerName || '').trim();
                const expectedCount = parseWholeNumber(createForm.expectedCount);
                const diagnosis = String(createForm.diagnosis || '').trim();
                const penNames = String(createForm.penNames || '').trim();

                if (!customerName || !expectedCount) {
                    onMessage?.({ type: 'error', message: "Enter the customer name and a whole-number expected pen count." });
                    return;
                }

                const didSucceed = await onCreateCase(customerName, expectedCount, diagnosis, penNames);
                if (didSucceed) {
                    setCreateForm({
                        customerName: '',
                        expectedCount: '',
                        diagnosis: '',
                        penNames: '',
                    });
                }
            };

            const roleLabel = formatRoleLabel(adminUser?.role, 'Admin');

            return (
                <div className="section-width flex flex-col h-full animate-fade-in overflow-hidden">
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-4 shrink-0">
                        <div>
                            <div className="card-eyebrow text-[#0f766e]">{roleLabel}</div>
                            <h3 className="text-2xl md:text-3xl font-bold font-poppins text-[#060606] mt-1">Pen Hospital</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={onRefresh}
                                disabled={isFetchingPenHospital || isSubmittingPenHospital}
                                className="brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
                            >
                                <i className={`fas ${isFetchingPenHospital ? 'fa-circle-notch spinner' : 'fa-rotate-right'} text-[#0f766e]`}></i>
                                <span>{isFetchingPenHospital ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-4 min-h-0 flex-1">
                        <div className="space-y-4">
                            <div className="brutal-card bg-white p-4 md:p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-lg font-bold font-poppins text-[#060606]">Open A Case</h4>
                                        <p className="text-xs font-bold text-gray-500 mt-1">Admins start each repair case here. New cases begin as diagnosed.</p>
                                    </div>
                                    <div className="surface-rounded border-2 border-black bg-[#ccfbf1] px-3 py-1 text-xs font-bold uppercase">
                                        {penHospitalCases.length} total
                                    </div>
                                </div>

                                <div className="space-y-3 mt-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2">Customer Name</label>
                                        <input
                                            type="text"
                                            value={createForm.customerName}
                                            onChange={e => setCreateForm(prev => ({ ...prev, customerName: e.target.value }))}
                                            className="brutal-input w-full px-3 py-2 text-sm"
                                            placeholder="Who sent the pens in?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2">Pens Expected</label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={createForm.expectedCount}
                                            onChange={e => setCreateForm(prev => ({ ...prev, expectedCount: e.target.value }))}
                                            className="brutal-input w-full px-3 py-2 text-sm"
                                            placeholder="How many pens are coming in?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2">Diagnosis</label>
                                        <input
                                            type="text"
                                            value={createForm.diagnosis}
                                            onChange={e => setCreateForm(prev => ({ ...prev, diagnosis: String(e.target.value || '').slice(0, 300) }))}
                                            className="brutal-input w-full px-3 py-2 text-sm"
                                            placeholder="What are we expecting to repair?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wide text-[#060606] mb-2">Pen Names (Optional)</label>
                                        <textarea
                                            value={createForm.penNames}
                                            onChange={e => setCreateForm(prev => ({ ...prev, penNames: String(e.target.value || '').slice(0, 600) }))}
                                            rows={2}
                                            className="brutal-input w-full min-h-[88px] px-3 py-2 text-sm resize-none"
                                            placeholder="List pen names, one per line or separated by commas."
                                        />
                                    </div>

                                    <button
                                        onClick={submitCreate}
                                        disabled={isSubmittingPenHospital}
                                        className="brutal-btn w-full bg-[#2dd4bf] hover:bg-[#14b8a6] px-4 py-3 text-sm flex items-center justify-center gap-2"
                                    >
                                        <i className={`fas ${isSubmittingPenHospital ? 'fa-circle-notch spinner' : 'fa-suitcase-medical'}`}></i>
                                        <span>{isSubmittingPenHospital ? 'Saving...' : 'Create Case'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="min-h-0 flex flex-col overflow-y-auto no-scrollbar pr-1 pb-4">
                            <PenHospitalBoard
                                penHospitalCases={penHospitalCases}
                                currentUser={adminUser}
                                isSubmitting={isSubmittingPenHospital}
                                onUpdateStatus={onUpdateStatus}
                                emptyMessage="No Pen Hospital cases have been created yet."
                            />
                        </div>
                    </div>
                </div>
            );
        };

        const PublicOverviewPanel = ({ sheetData, inventoryRows, penHospitalCases, messages }) => {
            return (
                <div className="flex flex-col h-full animate-fade-in overflow-hidden">
                    <div className="mb-4 md:mb-6 shrink-0">
                        <h2 className="page-title">Today at a Glance</h2>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar shadow-safe-4 pt-1 pb-4 pr-2">
                        <div className="public-overview-masonry">
                            <div className="public-overview-left-column">
                                <div className="section-card public-overview-card public-overview-inventory-card bg-[#fff7ed] p-3 md:p-4">
                                    <InventorySnapshotPanel
                                        inventoryRows={inventoryRows}
                                        title="Inventory Snapshot"
                                    />
                                </div>
                                <div className="section-card public-overview-card public-overview-pen-hospital-card bg-[#f0fdfa] p-3 md:p-4">
                                    <PenHospitalOverviewPanel
                                        penHospitalCases={penHospitalCases}
                                    />
                                </div>
                            </div>
                            <div className="public-overview-right-column">
                                <div className="section-card public-overview-card public-overview-schedule-card bg-[#f8fafc] p-3 md:p-4">
                                    <TodaySchedulePanel sheetData={sheetData} />
                                </div>
                                <div className="section-card public-overview-card public-overview-message-card bg-[#fdf2f8] p-3 md:p-4">
                                    <MessageBoardPanel
                                        messages={messages}
                                        eyebrow=""
                                        title="Messages"
                                        subtitle="Read-only view of the shared staff notes board."
                                        readOnly={true}
                                        newestFirst={true}
                                        autoHeight={true}
                                        maxMessages={5}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
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
            const [createForm, setCreateForm] = useState({ sku: '', product: '', quantity: '' });
            const [drafts, setDrafts] = useState({});
            const openRows = sortInventoryRows(getOpenInventoryRows(inventoryRows));
            const awaitingCount = openRows.filter(row => Number(row.awaitingApproval || 0) > 0).length;
            const latestInventoryUpdate = openRows.reduce((latest, row) => {
                const rawTimestamp = row?.lastUpdatedIso || row?.lastUpdated || row?.createdAtIso || row?.createdAt || '';
                if (!rawTimestamp) return latest;
                const parsedTime = new Date(rawTimestamp).getTime();
                if (!Number.isFinite(parsedTime)) {
                    return latest || {
                        time: Number.NEGATIVE_INFINITY,
                        label: row?.lastUpdated || row?.createdAt || rawTimestamp,
                    };
                }
                if (!latest || parsedTime > latest.time) {
                    return {
                        time: parsedTime,
                        label: row?.lastUpdated || row?.createdAt || rawTimestamp,
                    };
                }
                return latest;
            }, null);
            const roleLabel = formatRoleLabel(adminUser?.role, 'Admin');

            const updateDraft = (rowNumber, field, value) => {
                setDrafts(prev => ({
                    ...prev,
                    [rowNumber]: {
                        ...(prev[rowNumber] || {}),
                        [field]: value,
                    }
                }));
            };

            const clearDraft = (rowNumber, field) => {
                setDrafts(prev => ({
                    ...prev,
                    [rowNumber]: {
                        ...(prev[rowNumber] || {}),
                        [field]: '',
                    }
                }));
            };

            const submitRowAction = async (row, field, submitter, options = {}) => {
                const quantity = parseWholeNumber(drafts[row.rowNumber]?.[field], { allowNegative: Boolean(options.allowNegative) });
                if (quantity === null) {
                    onMessage?.({ type: 'error', message: options.invalidMessage || "Enter a whole number before saving this inventory change." });
                    return;
                }

                const didSucceed = await submitter(row, quantity);
                if (didSucceed) {
                    clearDraft(row.rowNumber, field);
                }
            };

            const submitCreate = async () => {
                const sku = String(createForm.sku || '').trim().toUpperCase();
                const product = String(createForm.product || '').trim();
                const quantity = parseWholeNumber(createForm.quantity);
                if (!sku || !product || !quantity) {
                    onMessage?.({ type: 'error', message: "Enter a SKU, Name, and whole-number Need Qty." });
                    return;
                }

                const didSucceed = await onAddNeed(sku, product, quantity);
                if (didSucceed) {
                    setCreateForm({ sku: '', product: '', quantity: '' });
                }
            };

            return (
                <div className="section-width flex flex-col h-full animate-fade-in overflow-hidden">
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-4 shrink-0">
                        <div>
                            <div className="card-eyebrow text-[#38bdf8]">{roleLabel}</div>
                            <h3 className="section-title mt-1">Inventory Management</h3>
                            {latestInventoryUpdate && (
                                <p className="section-subtitle mt-1">
                                    Latest card update: {formatInventoryTimestamp(latestInventoryUpdate.label)}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="status-chip bg-[#fef3c7]">
                                {awaitingCount} awaiting
                            </div>
                            <button
                                onClick={onRefresh}
                                disabled={isFetchingInventory || isSubmittingInventory}
                                className="brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
                            >
                                <i className={`fas ${isFetchingInventory ? 'fa-circle-notch spinner' : 'fa-rotate-right'} text-[#38bdf8]`}></i>
                                <span>{isFetchingInventory ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[506px_278px] lg:justify-start gap-4 min-h-0 flex-1">
                        <div className="min-h-0 overflow-y-auto no-scrollbar pr-1 space-y-4">
                            {openRows.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 font-bold text-sm md:text-lg border-2 border-dashed border-gray-300 rounded-xl bg-white">
                                    No active inventory rows are open.
                                </div>
                            ) : openRows.map(row => (
                                <div key={row.rowNumber} className="section-card panel-content-card surface-rounded">
                                    <div className="inventory-card-header">
                                        <div className="inventory-card-meta-block shrink-0 md:basis-[150px]">
                                            <div className="inventory-card-label">SKU</div>
                                            <div className="inventory-card-sku mt-1">{getInventorySkuText(row)}</div>
                                        </div>
                                        <div className="inventory-card-meta-block min-w-0 flex-1">
                                            <div className="inventory-card-label">Pen Name</div>
                                            <h4 className="inventory-card-name mt-1">{getInventoryNameText(row)}</h4>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-5 gap-2.5 mt-4">
                                        <div className="surface-rounded border-2 border-black bg-[#f5f3ff] px-2.5 py-2.5 min-h-[88px] flex flex-col justify-between">
                                            <div className="inventory-stat-label leading-tight">Needed</div>
                                            <div className="inventory-stat-value text-2xl leading-none">{row.needed}</div>
                                        </div>
                                        <div className="surface-rounded border-2 border-black bg-[#ecfccb] px-2.5 py-2.5 min-h-[88px] flex flex-col justify-between">
                                            <div className="inventory-stat-label leading-tight">In Process</div>
                                            <div className="inventory-stat-value text-2xl leading-none">{row.inProcess}</div>
                                        </div>
                                        <div className="surface-rounded border-2 border-black bg-[#fef3c7] px-2.5 py-2.5 min-h-[88px] flex flex-col justify-between">
                                            <div className="inventory-stat-label leading-tight">Awaiting Approval</div>
                                            <div className="inventory-stat-value text-2xl leading-none">{row.awaitingApproval}</div>
                                        </div>
                                        <div className="surface-rounded border-2 border-black bg-[#d1fae5] px-2.5 py-2.5 min-h-[88px] flex flex-col justify-between">
                                            <div className="inventory-stat-label leading-tight">Approved</div>
                                            <div className="inventory-stat-value text-2xl leading-none">{row.addedToStore}</div>
                                        </div>
                                        <div className="surface-rounded border-2 border-black bg-[#fee2e2] px-2.5 py-2.5 min-h-[88px] flex flex-col justify-between">
                                            <div className="inventory-stat-label leading-tight">Still Needed</div>
                                            <div className="inventory-stat-value text-2xl leading-none">{row.stillNeeded}</div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-2.5 mt-3 items-stretch">
                                        <div className="surface-rounded border-2 border-black bg-[#eff6ff] p-2.5 flex flex-col min-h-[154px]">
                                            <div className="card-title text-base">Adjust Needed</div>
                                            <input
                                                type="number"
                                                step="1"
                                                value={drafts[row.rowNumber]?.adjust || ''}
                                                onChange={e => updateDraft(row.rowNumber, 'adjust', e.target.value)}
                                                className="brutal-input w-full px-3 py-2 text-sm mt-2.5"
                                                placeholder="0"
                                            />
                                            <button
                                                onClick={() => submitRowAction(row, 'adjust', onAdjustNeed, { allowNegative: true, invalidMessage: "Enter a whole-number adjustment like 5 or -2." })}
                                                disabled={isSubmittingInventory}
                                                className="brutal-btn action-button action-button-fixed action-button-iconless bg-[#60a5fa] hover:bg-[#3b82f6] mt-auto self-start"
                                            >
                                                Save
                                            </button>
                                        </div>

                                        <div className="surface-rounded border-2 border-black bg-[#f0fdf4] p-2.5 flex flex-col min-h-[154px]">
                                            <div className="card-title text-base">Approve</div>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={drafts[row.rowNumber]?.approve || ''}
                                                onChange={e => updateDraft(row.rowNumber, 'approve', e.target.value)}
                                                className="brutal-input w-full px-3 py-2 text-sm mt-2.5"
                                                placeholder="0"
                                            />
                                            <button
                                                onClick={() => submitRowAction(row, 'approve', onApprove)}
                                                disabled={isSubmittingInventory || row.awaitingApproval <= 0}
                                                className="brutal-btn action-button action-button-fixed action-button-iconless bg-[#4ade80] hover:bg-[#22c55e] mt-auto self-start"
                                            >
                                                Approve
                                            </button>
                                        </div>

                                        <div className="surface-rounded border-2 border-black bg-[#fff7ed] p-2.5 flex flex-col min-h-[154px]">
                                            <div className="card-title text-base">Send Back</div>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={drafts[row.rowNumber]?.reject || ''}
                                                onChange={e => updateDraft(row.rowNumber, 'reject', e.target.value)}
                                                className="brutal-input w-full px-3 py-2 text-sm mt-2.5"
                                                placeholder="0"
                                            />
                                            <button
                                                onClick={() => submitRowAction(row, 'reject', onReject)}
                                                disabled={isSubmittingInventory || row.awaitingApproval <= 0}
                                                className="brutal-btn action-button action-button-fixed action-button-iconless bg-[#fb923c] hover:bg-[#f97316] mt-auto self-start"
                                            >
                                                Send Back
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="brutal-card bg-white p-4 md:p-5">
                                <div>
                                    <h4 className="card-title text-lg">Start Inventory Request</h4>
                                    <p className="section-subtitle mt-1">Start a new SKU request or increase an open row.</p>
                                </div>
                                <div className="space-y-3 mt-4">
                                    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                                        <div>
                                            <label className="field-label block mb-2">SKU</label>
                                            <input
                                                type="text"
                                                value={createForm.sku}
                                                onChange={e => setCreateForm(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                                                className="brutal-input w-full px-3 py-2 text-sm"
                                                placeholder="SKU"
                                            />
                                        </div>
                                        <div>
                                            <label className="field-label block mb-2">Name</label>
                                            <input
                                                type="text"
                                                value={createForm.product}
                                                onChange={e => setCreateForm(prev => ({ ...prev, product: e.target.value }))}
                                                className="brutal-input w-full px-3 py-2 text-sm"
                                                placeholder="Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 items-end">
                                        <div>
                                            <label className="field-label block mb-2">Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={createForm.quantity}
                                                onChange={e => setCreateForm(prev => ({ ...prev, quantity: e.target.value }))}
                                                className="brutal-input w-full px-3 py-2 text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                        <button
                                            onClick={submitCreate}
                                            disabled={isSubmittingInventory}
                                            className="brutal-btn action-button action-button-fixed action-button-iconless bg-[#4ade80] hover:bg-[#22c55e] justify-self-start"
                                        >
                                            <i className={`fas ${isSubmittingInventory ? 'fa-circle-notch spinner' : 'fa-plus'}`}></i>
                                            <span>{isSubmittingInventory ? 'Submitting...' : 'Submit'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const AdminPayrollWorkspace = ({
            adminUser,
            employees,
            sheetData,
            isRefreshing,
            onRefresh,
        }) => {
            if (!adminUser) return null;
            const safeEmployees = Array.isArray(employees) ? employees : [];
            const safeRows = Array.isArray(sheetData) ? sheetData : [];
            const currentPeriod = buildPayrollPeriodFromStart(getPayrollPeriodStart(new Date()));
            const sortedStaffEmployees = sortEmployeesForDisplay(
                safeEmployees.filter(emp => !isAdminRole(emp?.role))
            );
            const adminNameSet = new Set(
                safeEmployees
                    .filter(emp => isAdminRole(emp?.role))
                    .map(emp => String(emp?.name || '').trim().toLowerCase())
                    .filter(Boolean)
            );

            const payrollCandidateRows = safeRows.filter(row => {
                const name = String(row?.name || '').trim();
                if (!name || adminNameSet.has(name.toLowerCase())) return false;
                if (isTimeOffRow(row) || !isPayrollRelevantRow(row)) return false;

                const rowDate = parseLocalDate(row?.date);
                return !isNaN(rowDate.getTime());
            });
            const staffEmployeeNames = sortedStaffEmployees
                .map(emp => String(emp?.name || '').trim())
                .filter(Boolean);
            const knownEmployeeNameSet = new Set(staffEmployeeNames.map(name => name.toLowerCase()));
            const rowOnlyEmployeeNames = [...new Set(
                payrollCandidateRows
                    .map(row => String(row?.name || '').trim())
                    .filter(Boolean)
            )]
                .filter(name => !knownEmployeeNameSet.has(name.toLowerCase()))
                .sort((a, b) => a.localeCompare(b));
            const employeeNames = [...staffEmployeeNames, ...rowOnlyEmployeeNames];

            const rowsByPeriodKey = payrollCandidateRows.reduce((acc, row) => {
                const periodKey = normalizeDate(getPayrollPeriodStart(row.date));
                if (!acc[periodKey]) acc[periodKey] = [];
                acc[periodKey].push(row);
                return acc;
            }, {});

            const payrollPeriods = [...new Set([
                currentPeriod.key,
                ...Object.keys(rowsByPeriodKey),
            ])]
                .sort((a, b) => b.localeCompare(a))
                .map(periodKey => {
                    const period = buildPayrollPeriodFromStart(periodKey);
                    const periodRows = rowsByPeriodKey[period.key] || [];
                    const employeeSummaries = employeeNames.map(name => {
                        const rows = periodRows.filter(row => String(row?.name || '').trim() === name);
                        const workedRows = rows.filter(row => getPayrollRowMinutes(row) > 0);
                        return {
                            name,
                            workedEntryCount: workedRows.length,
                            editedEntryCount: workedRows.filter(row => parseReasonCell(row.reason).length > 0).length,
                            totalMinutes: workedRows.reduce((sum, row) => sum + getPayrollRowMinutes(row), 0),
                        };
                    });

                    return {
                        ...period,
                        isActive: period.key === currentPeriod.key,
                        totalMinutes: employeeSummaries.reduce((sum, summary) => sum + summary.totalMinutes, 0),
                        employeeSummaries,
                    };
                });
            const roleLabel = formatRoleLabel(adminUser?.role, 'Admin');
            const formatEntryCount = (count) => `${count} ${count === 1 ? 'Entry' : 'Entries'}`;

            return (
                <div className="section-width flex flex-col h-full min-h-0 animate-fade-in overflow-hidden">
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-4 shrink-0">
                        <div>
                            <div className="card-eyebrow text-[#38bdf8]">{roleLabel}</div>
                            <h3 className="section-title mt-1">Payroll Period Hours</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shadow-safe-4">
                            <button
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                className="brutal-btn action-button action-button-fixed action-button-iconless bg-white hover:bg-gray-50"
                            >
                                <i className={`fas ${isRefreshing ? 'fa-circle-notch spinner' : 'fa-rotate-right'} text-[#38bdf8]`}></i>
                                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar shadow-safe-4 pr-1 pb-4">
                        {employeeNames.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm md:text-base font-bold text-gray-400 bg-white">
                                No employee payroll rows were found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 content-start">
                                {payrollPeriods.map(period => (
                                    <div
                                        key={period.key}
                                        className={`section-card panel-content-card ${period.isActive ? 'bg-[#dbeafe]' : 'bg-[#f0fdf4]'}`}
                                    >
                                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px] lg:items-center">
                                            <div className="min-w-0">
                                                <div className="font-bold font-poppins text-[#060606] text-lg md:text-xl truncate">
                                                    {period.label} ({period.isActive ? 'Active' : 'Closed'})
                                                </div>
                                            </div>
                                            <div className="rounded-xl border-2 border-black bg-white px-4 py-3">
                                                <div className="text-[10px] uppercase font-bold tracking-[0.12em] text-gray-500">Total Hours</div>
                                                <div className="text-xl font-bold font-poppins text-[#060606] mt-1">{formatPayrollHours(period.totalMinutes)}</div>
                                            </div>
                                            <div className="rounded-xl border-2 border-black bg-white px-4 py-3">
                                                <div className="text-[10px] uppercase font-bold tracking-[0.12em] text-gray-500">Pay Date</div>
                                                <div className="text-sm md:text-base font-bold font-poppins text-[#060606] mt-1">{formatFullDate(period.payDate)}</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            {period.employeeSummaries.map(summary => (
                                                <div key={`${period.key}-${summary.name}`} className="rounded-xl border-2 border-black bg-white px-4 py-3">
                                                    <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_120px_110px_170px] md:items-center">
                                                        <div className="font-bold font-poppins text-[#060606] text-sm md:text-base truncate">
                                                            {summary.name}
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-600">
                                                            {formatEntryCount(summary.workedEntryCount)}
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-600">
                                                            {summary.editedEntryCount} Edited
                                                        </div>
                                                        <div className="text-sm md:text-base font-bold font-poppins text-[#060606] md:text-right">
                                                            Total Hours {formatPayrollHours(summary.totalMinutes)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        const TeamScheduleModal = ({ isOpen, onClose, sheetData, onRefresh }) => {
            const [currentWeekStart, setCurrentWeekStart] = useState(null);

            useEffect(() => {
                if (isOpen) {
                    setCurrentWeekStart(getWeekStartDate(new Date()));
                    if (onRefresh) {
                        onRefresh(false, { showSpinner: false });
                    }
                }
            }, [isOpen]);

            if (!isOpen || !currentWeekStart) return null;

            const schedLogs = sheetData.filter(l => (l.schedIn || l.schedOut) && isPublishedSchedule(l));

            const nextWeek = () => {
                const next = new Date(currentWeekStart);
                next.setDate(next.getDate() + 7);
                setCurrentWeekStart(next);
            };

            const prevWeek = () => {
                const prev = new Date(currentWeekStart);
                prev.setDate(prev.getDate() - 7);
                setCurrentWeekStart(prev);
            };

            const weekDays = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(currentWeekStart);
                d.setDate(d.getDate() + i);
                return d;
            });

            const getYYYYMMDD = (d) => {
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            };

            const formatShortDate = (d) => {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            };
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const todayYYYYMMDD = getYYYYMMDD(new Date());

            return (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="brutal-card w-full max-w-7xl overflow-hidden flex flex-col max-h-[95vh]">
                        
                        {/* Header & Controls */}
                        <div className="p-4 md:p-6 border-b-3 border-black flex flex-col md:flex-row justify-between items-center bg-[#38bdf8] gap-4">
                            <div>
                                <h3 className="text-2xl font-bold font-poppins text-[#060606] text-center md:text-left">Schedule</h3>
                                <p className="text-sm font-bold mt-1 text-[#060606]/70 text-center md:text-left">Weekly View Â· Published shifts only</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-4 bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_#000000]">
                                    <button onClick={prevWeek} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#060606] transition-colors font-bold font-poppins text-lg">
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    <span className="font-bold font-poppins text-[#060606] w-40 text-center text-lg">
                                        {formatShortDate(currentWeekStart)} - {formatShortDate(weekDays[6])}
                                    </span>
                                    <button onClick={nextWeek} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#060606] transition-colors font-bold font-poppins text-lg">
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>

                            <button onClick={onClose} className="brutal-btn w-12 h-12 bg-white flex items-center justify-center text-[#060606] hover:bg-gray-100 text-xl absolute md:relative top-4 right-4 md:top-auto md:right-auto">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white no-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 lg:gap-4 h-full">
                                {weekDays.map((dayObj, i) => {
                                    const dayKey = getYYYYMMDD(dayObj);
                                    const dayShifts = schedLogs.filter(log => normalizeDate(log.date) === dayKey);
                                    const isToday = todayYYYYMMDD === dayKey;
                                    
                                    return (
                                        <div key={dayKey} className={`flex flex-row lg:flex-col rounded-xl lg:rounded-2xl border-2 border-black overflow-hidden lg:min-h-[150px] shadow-[4px_4px_0px_0px_#000000] ${isToday ? 'bg-[#e0f2fe]' : 'bg-white'}`}>
                                            <div className={`p-2 lg:p-3 flex flex-col justify-center items-center border-r-2 lg:border-r-0 lg:border-b-2 border-black w-20 lg:w-full shrink-0 ${isToday ? 'bg-[#38bdf8] text-[#060606]' : 'bg-gray-50 text-[#060606]'}`}>
                                                <div className="text-[11px] lg:text-sm font-bold font-poppins uppercase tracking-wider">{dayNames[i]}</div>
                                                <div className={`text-xl lg:text-2xl font-bold font-poppins mt-0.5 lg:mt-1`}>
                                                    {dayObj.getDate()}
                                                </div>
                                            </div>
                                            <div className="p-3 lg:p-4 flex-1 flex flex-col justify-center lg:justify-start gap-3">
                                                {dayShifts.length > 0 ? (
                                                    dayShifts.map((shift, shiftIdx) => (
                                                        <div key={shiftIdx} className="bg-white border-2 border-black rounded-lg p-2 lg:p-3 shadow-[2px_2px_0px_0px_#000000] relative">
                                                            {isPublishedSchedule(shift) && (
                                                                <div className="absolute top-2 right-2 text-[#38bdf8]" title="Published Schedule">
                                                                    <i className="fas fa-check-circle text-sm lg:text-base"></i>
                                                                </div>
                                                            )}
                                                            <div className="font-bold font-poppins text-[#060606] text-sm lg:text-base leading-tight pr-5">{shift.name}</div>
                                                            <div className="text-gray-600 text-[11px] lg:text-sm font-bold mt-1">
                                                                <i className="far fa-clock mr-1 text-[#fb7185]"></i>
                                                                {shift.schedIn} - {shift.schedOut}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex items-center justify-start lg:justify-center h-full text-sm text-gray-400 font-bold italic px-2 lg:px-0">
                                                        No shifts
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            );
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
            onClearTimeOff,
        }) => {
            const [weekJumpValue, setWeekJumpValue] = useState('');
            const [editorDraft, setEditorDraft] = useState(null);

            const sortedEmployees = sortEmployeesForDisplay(employees);

            const weekDays = buildWeekDays(weekStart);
            const currentWeekKey = normalizeDate(weekStart);
            const loadableWeekOptions = (Array.isArray(savedWeekOptions) ? savedWeekOptions : [])
                .filter(option => option?.weekKey && option.weekKey !== currentWeekKey);

            const visibleTemplates = getVisibleAdminShiftTemplates(shiftTemplates);
            const quickActionCount = visibleTemplates.length + 1;

            const formatShortDate = (dateValue) => {
                return parseLocalDate(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            };

            const selectedDraft = selectedCell ? getCellDraft(selectedCell.name, selectedCell.date) : null;
            const isSelectingDayEmployee = Boolean(selectedDraft && !String(selectedDraft.name || '').trim());
            const selectedTimeOffRow = selectedCell && String(selectedCell.name || '').trim()
                ? getTimeOffRowForEmployeeDate(sheetData, selectedCell.name, selectedCell.date)
                : null;
            const selectedTimeOffMeta = parseTimeOffMetadata(selectedTimeOffRow?.reason);
            const isReviewingTimeOff = Boolean(selectedTimeOffRow && !isSelectingDayEmployee);

            useEffect(() => {
                const selectedName = String(selectedCell?.name || '').trim();
                if (!selectedCell || !selectedName) {
                    setEditorDraft(null);
                    if (onTemplateNameChange) onTemplateNameChange('');
                    return;
                }

                const nextDraft = getCellDraft(selectedName, selectedCell.date);
                setEditorDraft({
                    ...nextDraft,
                    name: selectedName,
                    date: normalizeDate(selectedCell.date),
                    scheduleStatus: normalizeAdminScheduleStatus(nextDraft.scheduleStatus),
                    clearSchedule: Boolean(nextDraft.clearSchedule),
                });
                if (onTemplateNameChange) onTemplateNameChange('');
            }, [selectedCell ? selectedCell.name : '', selectedCell ? selectedCell.date : '']);

            const activeSelectedDraft = isSelectingDayEmployee ? selectedDraft : (editorDraft || selectedDraft);
            const getScheduledShiftPreview = (draft) => {
                if (!draft || draft.clearSchedule) {
                    return {
                        formattedIn: '',
                        formattedOut: '',
                        minutes: null,
                        hasAssignedShift: false,
                    };
                }

                const formattedIn = formatTimeField(draft.schedIn, draft.schedInPeriod);
                const formattedOut = formatTimeField(draft.schedOut, draft.schedOutPeriod);
                return {
                    formattedIn,
                    formattedOut,
                    minutes: calculateWorkedMinutes(formattedIn, formattedOut),
                    hasAssignedShift: Boolean(formattedIn && formattedOut),
                };
            };

            const selectedShiftPreview = getScheduledShiftPreview(activeSelectedDraft);
            const selectedFormattedIn = selectedShiftPreview.formattedIn;
            const selectedFormattedOut = selectedShiftPreview.formattedOut;
            const selectedPreviewMinutes = selectedShiftPreview.minutes;
            const canSaveEditorDraft = Boolean(
                activeSelectedDraft
                && !isReviewingTimeOff
                && !isSelectingDayEmployee
                && (activeSelectedDraft.clearSchedule || (selectedFormattedIn && selectedFormattedOut))
            );
            const canSaveTemplate = Boolean(
                activeSelectedDraft
                && !isReviewingTimeOff
                && !isSelectingDayEmployee
                && !activeSelectedDraft.clearSchedule
                && selectedFormattedIn
                && selectedFormattedOut
                && String(templateName || '').trim()
            );

            const updateEditorDraft = (patch) => {
                setEditorDraft(prev => {
                    if (!prev) return prev;
                    const nextPatch = typeof patch === 'function' ? patch(prev) : patch;
                    return {
                        ...prev,
                        ...nextPatch,
                        name: prev.name,
                        date: prev.date,
                        sourceRow: nextPatch?.sourceRow === undefined ? (prev.sourceRow || null) : nextPatch.sourceRow,
                    };
                });
            };

            const clearEditorForm = () => {
                updateEditorDraft({
                    schedIn: '',
                    schedInPeriod: 'AM',
                    schedOut: '',
                    schedOutPeriod: 'PM',
                    scheduleStatus: DEFAULT_ADMIN_SCHEDULE_STATUS,
                    clearSchedule: false,
                });
            };

            const applyTemplateToEditorDraft = (template) => {
                if (!template || isSelectingDayEmployee || isReviewingTimeOff) return;

                updateEditorDraft(currentDraft => {
                    if (template.clearSchedule) {
                        return {
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
                        schedIn: parsedIn.time,
                        schedInPeriod: parsedIn.period || 'AM',
                        schedOut: parsedOut.time,
                        schedOutPeriod: parsedOut.period || 'PM',
                        scheduleStatus: normalizeAdminScheduleStatus(template.scheduleStatus),
                        clearSchedule: false,
                    };
                });
            };

            const handleSaveShift = () => {
                if (!canSaveEditorDraft || !activeSelectedDraft || isSelectingDayEmployee || isReviewingTimeOff) return;

                updateCellDraft(activeSelectedDraft.name, activeSelectedDraft.date, {
                    schedIn: activeSelectedDraft.clearSchedule ? '' : activeSelectedDraft.schedIn,
                    schedInPeriod: activeSelectedDraft.clearSchedule ? 'AM' : activeSelectedDraft.schedInPeriod,
                    schedOut: activeSelectedDraft.clearSchedule ? '' : activeSelectedDraft.schedOut,
                    schedOutPeriod: activeSelectedDraft.clearSchedule ? 'PM' : activeSelectedDraft.schedOutPeriod,
                    scheduleStatus: activeSelectedDraft.clearSchedule ? '' : normalizeAdminScheduleStatus(activeSelectedDraft.scheduleStatus),
                    clearSchedule: Boolean(activeSelectedDraft.clearSchedule),
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
                const isDirty = !areAdminScheduleDraftsEquivalent(draft, draft.sourceRow
                    ? buildAdminScheduleDraftFromRow(draft.sourceRow, employeeName, dayKey)
                    : buildEmptyAdminScheduleForm(employeeName, dayKey));
                const cellStateClass = isSelected
                    ? 'bg-[#38bdf8] text-[#060606]'
                    : isDirty
                        ? 'bg-[#fef3c7] text-[#060606]'
                        : hasAssignedShift
                            ? 'bg-white text-[#060606]'
                            : 'bg-[#f8fafc] text-[#060606]';

                return {
                    draft,
                    timeOffRow,
                    timeOffMeta,
                    cellFormattedIn,
                    cellFormattedOut,
                    cellMinutes,
                    hasAssignedShift,
                    isSelected,
                    cellStateClass,
                };
            };

            const employeeWeekSummaries = sortedEmployees.map(employee => {
                const totalMinutes = weekDays.reduce((sum, dayObj) => {
                    const dayKey = normalizeDate(dayObj);
                    const shiftPreview = getScheduledShiftPreview(getCellDraft(employee.name, dayKey));
                    return sum + (shiftPreview.hasAssignedShift ? (shiftPreview.minutes || 0) : 0);
                }, 0);
                const shiftCount = weekDays.reduce((count, dayObj) => {
                    const dayKey = normalizeDate(dayObj);
                    return count + (getScheduledShiftPreview(getCellDraft(employee.name, dayKey)).hasAssignedShift ? 1 : 0);
                }, 0);

                return {
                    id: employee.id || employee.name,
                    name: employee.name,
                    department: employee.department || 'Team',
                    totalMinutes,
                    shiftCount,
                };
            });
            const totalScheduledWeekMinutes = employeeWeekSummaries.reduce((sum, employeeSummary) => sum + employeeSummary.totalMinutes, 0);

            const renderWeekBoardDay = (dayObj) => {
                const dayKey = normalizeDate(dayObj);
                const isToday = dayKey === normalizeDate(new Date());
                const weekdayLabel = dayObj.toLocaleDateString('en-US', { weekday: 'long' });
                const dayEntries = sortedEmployees
                    .map(emp => ({
                        employee: emp,
                        ...getWeekGridCellState(emp.name, dayKey),
                    }))
                    .filter(entry => entry.timeOffRow || entry.hasAssignedShift || entry.draft.clearSchedule || entry.isSelected);

                return (
                    <div
                        key={dayKey}
                        className={[
                            'section-card admin-week-board-day-card overflow-hidden bg-white',
                            isToday ? 'ring-4 ring-[#bae6fd]' : '',
                        ].filter(Boolean).join(' ')}
                    >
                        <button
                            type="button"
                            onClick={() => onSelectCell('', dayKey)}
                            className={`w-full admin-week-board-day-button border-b-2 border-black text-left ${isToday ? 'bg-[#38bdf8] text-[#060606]' : 'bg-[#bae6fd] text-[#060606]'}`}
                        >
                            <div className="card-eyebrow text-[#060606]">{weekdayLabel}</div>
                            <div className="card-title mt-1">{formatShortDate(dayObj)}</div>
                        </button>

                        <div className={`admin-week-board-scroll no-scrollbar ${dayEntries.length > 0 ? 'space-y-2' : ''}`}>
                            {dayEntries.map(({ employee, draft, timeOffRow, timeOffMeta, cellFormattedIn, cellFormattedOut, cellMinutes, hasAssignedShift, cellStateClass, isSelected }, index) => {
                                const isTimeOffApproved = isApprovedTimeOffRow(timeOffRow);
                                const surfaceClass = timeOffRow
                                    ? (isTimeOffApproved ? 'bg-[#fee2e2]' : 'bg-[#fff7ed]')
                                    : draft.clearSchedule
                                        ? 'bg-[#fee2e2]'
                                        : isSelected
                                            ? 'bg-[#dbeafe]'
                                            : cellStateClass;
                                const outlineClass = isSelected ? 'ring-2 ring-[#38bdf8]' : '';

                                return (
                                    <button
                                        key={`${dayKey}-${employee.id}-${index}`}
                                        type="button"
                                        onClick={() => onSelectCell(employee.name, dayKey)}
                                        className={`schedule-shift-card admin-week-board-shift-card w-full text-left transition-colors ${surfaceClass} ${outlineClass}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="card-title truncate">{employee.name}</div>
                                                <div className="card-meta mt-1 truncate">{employee.department || 'Team'}</div>
                                            </div>
                                            {(timeOffRow || draft.clearSchedule || isSelected) && (
                                                <div className="card-eyebrow text-gray-500">
                                                    {timeOffRow
                                                        ? (isTimeOffApproved ? 'Blocked' : 'Request')
                                                        : (draft.clearSchedule ? 'Clearing' : 'Editing')}
                                                </div>
                                            )}
                                        </div>

                                        {timeOffRow ? (
                                            <>
                                                <div className="card-meta text-[#060606] mt-2.5">
                                                    {getTimeOffRangeLabel(timeOffRow, timeOffMeta)}
                                                </div>
                                                <div className="card-meta mt-1">
                                                    {isTimeOffApproved ? 'Approved block on the schedule' : 'Awaiting admin approval'}
                                                </div>
                                                {hasAssignedShift && (
                                                    <div className="card-meta mt-1 text-gray-500">
                                                        Current shift: {cellFormattedIn} - {cellFormattedOut}
                                                    </div>
                                                )}
                                            </>
                                        ) : draft.clearSchedule ? (
                                            <div className="card-meta text-[#060606] mt-2.5">Schedule will be removed</div>
                                        ) : hasAssignedShift ? (
                                            <div className="admin-week-board-shift-time mt-2.5">{cellFormattedIn} - {cellFormattedOut}</div>
                                        ) : null}

                                        {!timeOffRow && (draft.clearSchedule || hasAssignedShift) && (
                                            <div className="card-meta admin-week-board-shift-duration mt-1">
                                                {draft.clearSchedule ? 'Removal staged' : formatWorkedDurationForDisplay(cellMinutes)}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            };

            if (!adminUser) return null;
            const roleLabel = formatRoleLabel(adminUser?.role, 'Admin');

            return (
                <div className="section-width flex flex-col h-full min-h-0 animate-fade-in overflow-y-auto pr-1">
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-4 md:mb-6 shrink-0">
                        <div>
                            <div className="card-eyebrow text-[#38bdf8]">{roleLabel}</div>
                            <h3 className="page-title sm:whitespace-nowrap">Schedule Builder</h3>
                            <div className="mt-3 space-y-1">
                                <div className="text-xs md:text-sm font-bold text-gray-500">
                                    {selectedDraft
                                        ? (isSelectingDayEmployee
                                            ? `Choose employee - ${formatMonthDayDate(selectedDraft.date)}`
                                            : selectedTimeOffRow
                                                ? `${selectedDraft.name} - ${getTimeOffStatusLabel(selectedTimeOffRow)}`
                                                : `${selectedDraft.name} - ${formatMonthDayDate(selectedDraft.date)}`)
                                        : 'Click a date to add shifts'}
                                </div>
                                <div className="text-xs md:text-sm font-bold text-gray-500">
                                    {isRefreshing ? 'Syncing latest schedule rows...' : `${sortedEmployees.length} active team member${sortedEmployees.length === 1 ? '' : 's'} in view`}
                                </div>
                            </div>
                        </div>
                        <div className="admin-studio-toolbar">
                            <div className="admin-studio-toolbar-wide">
                                <div className="admin-studio-control-shell admin-studio-nav-shell">
                                    <button onClick={onPrevWeek} className="admin-studio-nav-button font-bold font-poppins text-lg">
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    <span className="admin-studio-range-label">
                                        {formatWeekRangeLabel(weekStart)}
                                    </span>
                                    <button onClick={onNextWeek} className="admin-studio-nav-button font-bold font-poppins text-lg">
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="admin-studio-toolbar-wide">
                                <div className="admin-studio-control-shell admin-studio-select-shell">
                                    <i className="fas fa-folder-open text-[#38bdf8]"></i>
                                    <select
                                        value={weekJumpValue}
                                        onChange={e => {
                                            const nextWeek = e.target.value;
                                            setWeekJumpValue(nextWeek);
                                            if (nextWeek) {
                                                onLoadSavedWeek?.(nextWeek);
                                                setWeekJumpValue('');
                                            }
                                        }}
                                        className="admin-studio-select"
                                        disabled={loadableWeekOptions.length === 0}
                                    >
                                        <option value="">
                                            {loadableWeekOptions.length === 0 ? 'No saved weeks yet' : 'Copy saved week'}
                                        </option>
                                        {loadableWeekOptions.map(option => (
                                            <option key={option.weekKey} value={option.weekKey}>
                                                {option.label} ({option.shiftCount} shift{option.shiftCount === 1 ? '' : 's'})
                                            </option>
                                        ))}
                                    </select>
                                    <i className="fas fa-chevron-down text-xs text-gray-500"></i>
                                </div>
                            </div>

                            <button
                                onClick={saveWeekSchedules}
                                disabled={isSubmitting || dirtyCount === 0}
                                className="brutal-btn admin-studio-action admin-studio-save-button bg-[#4ade80] hover:bg-[#22c55e] text-[#060606]"
                            >
                                <i className={`fas ${isSubmitting ? 'fa-circle-notch spinner' : 'fa-save'}`}></i>
                                <span>{isSubmitting ? 'Saving All...' : `Save All${dirtyCount === 0 ? '' : ` (${dirtyCount})`}`}</span>
                            </button>

                            <button
                                onClick={clearWeekSchedules}
                                disabled={isSubmitting || dirtyCount === 0}
                                className="brutal-btn admin-studio-action bg-white hover:bg-gray-50 text-[#060606]"
                            >
                                <i className="fas fa-eraser text-[#f43f5e]"></i>
                                <span>{`Clear All${dirtyCount === 0 ? '' : ` (${dirtyCount})`}`}</span>
                            </button>
                        </div>
                    </div>

                    <div className="section-card panel-content-card overflow-hidden flex flex-col flex-1 min-h-[520px] lg:min-h-0">
                        <div className="flex-1 overflow-auto pr-1 pb-1">
                            {sortedEmployees.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-center text-sm md:text-base font-bold text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl bg-[#f8fafc]">
                                    No active employees were found for scheduling.
                                </div>
                            ) : (
                                <div className="schedule-week-grid admin-week-board-grid">
                                    {weekDays.map(dayObj => renderWeekBoardDay(dayObj))}
                                </div>
                            )}
                        </div>

                        <div className="border-t-2 border-black bg-[#f8fafc] px-3 py-3 md:px-4 md:py-4">
                            <div className="grid grid-cols-1 gap-3">
                                <div className="section-card bg-white px-4 py-3">
                                    <div className="card-eyebrow text-[#38bdf8]">Week Total</div>
                                    <div className="card-title mt-2">{formatPayrollHours(totalScheduledWeekMinutes)} hrs</div>
                                </div>
                            </div>

                            <div className="section-card bg-white p-4 mt-3">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div>
                                        <div className="card-eyebrow text-[#38bdf8]">Hours by Person</div>
                                    </div>
                                    <div className="card-meta">{employeeWeekSummaries.length} team member{employeeWeekSummaries.length === 1 ? '' : 's'}</div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 mt-4">
                                    {employeeWeekSummaries.map(employeeSummary => (
                                        <div
                                            key={`week-summary-${employeeSummary.id}`}
                                            className={`section-card px-3 py-3 ${employeeSummary.totalMinutes > 0 ? 'bg-[#eff6ff]' : 'bg-[#f8fafc]'}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="card-title truncate text-sm">{employeeSummary.name}</div>
                                                    <div className="card-meta mt-1 truncate">{employeeSummary.department}</div>
                                                </div>
                                                <div className="card-eyebrow text-gray-500">{employeeSummary.shiftCount} shift{employeeSummary.shiftCount === 1 ? '' : 's'}</div>
                                            </div>
                                            <div className="card-title mt-3">{formatPayrollHours(employeeSummary.totalMinutes)} hrs</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedDraft && (
                        <div className="editor-modal-backdrop" onClick={onCloseEditor}>
                            <div className="brutal-card editor-modal bg-white p-4 md:p-6" onClick={e => e.stopPropagation()}>
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div>
                                        <div className="card-eyebrow text-[#38bdf8]">
                                            {isSelectingDayEmployee ? 'Choose Employee' : (isReviewingTimeOff ? 'Time-Off Review' : 'Schedule Editor')}
                                        </div>
                                        <h4 className="section-title mt-1">{isSelectingDayEmployee ? formatFullDate(selectedDraft.date) : selectedDraft.name}</h4>
                                        <p className="section-subtitle mt-1">
                                            {isSelectingDayEmployee
                                                ? 'Choose who you want to schedule for this day.'
                                                : formatFullDate(selectedDraft.date)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onCloseEditor}
                                        className="brutal-btn bg-white px-4 py-2 text-sm md:text-base flex items-center gap-2 self-start"
                                    >
                                        <i className="fas fa-xmark"></i>
                                        <span>Cancel</span>
                                    </button>
                                </div>

                                {isSelectingDayEmployee ? (
                                    <div className="section-card bg-[#f8fafc] p-4 mt-4">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div>
                                                <h5 className="card-title">Choose Employee</h5>
                                                <p className="section-subtitle mt-1">Select a team member to create or edit a shift for this day.</p>
                                            </div>
                                            <div className="card-meta">{sortedEmployees.length} available employee{sortedEmployees.length === 1 ? '' : 's'}</div>
                                        </div>

                                        <div className="card-grid mt-4">
                                            {sortedEmployees.map(employee => {
                                                const employeeState = getWeekGridCellState(employee.name, selectedDraft.date);
                                                const alreadyScheduled = employeeState.timeOffRow || employeeState.hasAssignedShift || employeeState.draft.clearSchedule;
                                                const selectionCardClass = employeeState.timeOffRow
                                                    ? (isApprovedTimeOffRow(employeeState.timeOffRow) ? 'bg-[#fee2e2]' : 'bg-[#fff7ed]')
                                                    : alreadyScheduled
                                                        ? 'bg-[#dbeafe]'
                                                        : 'bg-white hover:bg-[#f8fafc]';
                                                return (
                                                    <button
                                                        key={`${selectedDraft.date}-${employee.id}`}
                                                        type="button"
                                                        onClick={() => onSelectCell(employee.name, selectedDraft.date)}
                                                        className={`brutal-btn card-frame card-size-1x1 p-3 text-left flex flex-col justify-between ${selectionCardClass}`}
                                                    >
                                                        <div>
                                                            <div className="card-title text-sm">{employee.name}</div>
                                                            <div className="card-meta mt-1">{employee.department || 'Team'}</div>
                                                        </div>
                                                        <div className="card-meta mt-3 text-[#060606]">
                                                            {employeeState.timeOffRow
                                                                ? `${getTimeOffStatusLabel(employeeState.timeOffRow)} - ${getTimeOffRangeLabel(employeeState.timeOffRow, employeeState.timeOffMeta)}`
                                                                : employeeState.hasAssignedShift
                                                                ? `${employeeState.cellFormattedIn} - ${employeeState.cellFormattedOut}`
                                                                : (employeeState.draft.clearSchedule ? 'Clearing on save' : 'Add shift')}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : isReviewingTimeOff ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                            <div className="section-card bg-[#f8fafc] px-4 py-3">
                                                <div className="card-eyebrow">Requested Block</div>
                                                <div className="card-title mt-2">{getTimeOffRangeLabel(selectedTimeOffRow, selectedTimeOffMeta)}</div>
                                            </div>
                                            <div className="section-card bg-[#f8fafc] px-4 py-3">
                                                <div className="card-eyebrow">Status</div>
                                                <div className="card-title mt-2">
                                                    {isApprovedTimeOffRow(selectedTimeOffRow) ? 'Approved block' : 'Awaiting approval'}
                                                </div>
                                                {selectedTimeOffMeta?.approvedBy ? (
                                                    <div className="card-meta mt-1">Approved by {selectedTimeOffMeta.approvedBy}</div>
                                                ) : selectedTimeOffMeta?.requestedAt ? (
                                                    <div className="card-meta mt-1">Requested {formatHistoryTimestamp(selectedTimeOffMeta.requestedAt)}</div>
                                                ) : null}
                                            </div>
                                        </div>

                                        {(selectedFormattedIn && selectedFormattedOut) && (
                                            <div className="section-card bg-[#eff6ff] p-4 mt-4">
                                                <div className="card-title">Existing Scheduled Shift</div>
                                                <p className="section-subtitle mt-1">
                                                    This shift is still on the board until you approve the request or remove the block.
                                                </p>
                                                <div className="card-title mt-3">{selectedFormattedIn} - {selectedFormattedOut}</div>
                                            </div>
                                        )}

                                        <div className="section-card bg-white p-4 mt-4">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <h5 className="card-title">{isApprovedTimeOffRow(selectedTimeOffRow) ? 'Approved Time Off' : 'Time-Off Request'}</h5>
                                                    <p className="section-subtitle mt-1">
                                                        {isApprovedTimeOffRow(selectedTimeOffRow)
                                                            ? 'This employee is currently blocked on the schedule for this day.'
                                                            : 'Approve this request to block the day for the employee.'}
                                                    </p>
                                                </div>
                                                <div className={`status-chip ${isApprovedTimeOffRow(selectedTimeOffRow) ? 'bg-[#fecaca]' : 'bg-[#fde68a]'}`}>
                                                    {getTimeOffStatusLabel(selectedTimeOffRow)}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-col md:flex-row gap-3 md:justify-end">
                                                {!isApprovedTimeOffRow(selectedTimeOffRow) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onApproveTimeOff && onApproveTimeOff(selectedTimeOffRow)}
                                                        disabled={isSubmittingTimeOff}
                                                        className="brutal-btn bg-[#4ade80] hover:bg-[#22c55e] px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
                                                    >
                                                        <i className={`fas ${isSubmittingTimeOff ? 'fa-circle-notch spinner' : 'fa-check'}`}></i>
                                                        <span>{isSubmittingTimeOff ? 'Saving...' : 'Approve Request'}</span>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => onClearTimeOff && onClearTimeOff(selectedTimeOffRow)}
                                                    disabled={isSubmittingTimeOff}
                                                    className="brutal-btn bg-white px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
                                                >
                                                    <i className="fas fa-trash-can text-[#f43f5e]"></i>
                                                    <span>{isApprovedTimeOffRow(selectedTimeOffRow) ? 'Remove Block' : 'Clear Request'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                            <div className="section-card bg-[#f8fafc] px-4 py-3">
                                                <div className="card-eyebrow">Shift</div>
                                                <div className="card-title mt-2">
                                                    {activeSelectedDraft.clearSchedule
                                                        ? 'Clearing on save'
                                                        : ((selectedFormattedIn && selectedFormattedOut) ? `${selectedFormattedIn} - ${selectedFormattedOut}` : 'No shift assigned')}
                                                </div>
                                            </div>
                                            <div className="section-card bg-[#f8fafc] px-4 py-3">
                                                <div className="card-eyebrow">Duration</div>
                                                <div className="card-title mt-2">
                                                    {activeSelectedDraft.clearSchedule
                                                        ? 'Removed'
                                                        : (selectedPreviewMinutes === null ? '--' : formatWorkedDurationForDisplay(selectedPreviewMinutes))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="section-card bg-white p-4 mt-4">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <h5 className="card-title">Shift Details</h5>
                                                    <p className="section-subtitle mt-1">Enter the scheduled in time, scheduled out time, and status for this shift.</p>
                                                </div>
                                                {activeSelectedDraft.clearSchedule && (
                                                    <div className="status-chip bg-[#fee2e2]">Shift removal staged</div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-end mt-4">
                                                <div>
                                                    <label className="field-label block mb-2">Scheduled In</label>
                                                    <div className="w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-center gap-3 px-3 focus-within:shadow-[4px_4px_0px_0px_#000000] transition-shadow">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            placeholder="9:00"
                                                            value={activeSelectedDraft.clearSchedule ? '' : activeSelectedDraft.schedIn}
                                                            onChange={e => {
                                                                const next = normalizeTimeInputWithPeriod(e.target.value, activeSelectedDraft.schedInPeriod);
                                                                updateEditorDraft({
                                                                    schedIn: next.time,
                                                                    schedInPeriod: next.period,
                                                                    clearSchedule: false,
                                                                });
                                                            }}
                                                            className="w-[5ch] min-w-[5ch] py-3 font-bold text-sm md:text-base bg-transparent outline-none"
                                                            maxLength={5}
                                                        />
                                                        <div className="ml-auto flex shrink-0 items-center gap-2">
                                                            <button type="button" onClick={() => updateEditorDraft({ schedInPeriod: 'AM', clearSchedule: false })} className={`text-xs md:text-sm font-bold ${activeSelectedDraft.schedInPeriod === 'AM' ? 'text-[#060606]' : 'text-gray-400 hover:text-gray-500'}`}>AM</button>
                                                            <button type="button" onClick={() => updateEditorDraft({ schedInPeriod: 'PM', clearSchedule: false })} className={`text-xs md:text-sm font-bold ${activeSelectedDraft.schedInPeriod === 'PM' ? 'text-[#060606]' : 'text-gray-400 hover:text-gray-500'}`}>PM</button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="field-label block mb-2">Scheduled Out</label>
                                                    <div className="w-full border-2 border-black rounded-xl bg-white overflow-hidden flex items-center gap-3 px-3 focus-within:shadow-[4px_4px_0px_0px_#000000] transition-shadow">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            placeholder="5:00"
                                                            value={activeSelectedDraft.clearSchedule ? '' : activeSelectedDraft.schedOut}
                                                            onChange={e => {
                                                                const next = normalizeTimeInputWithPeriod(e.target.value, activeSelectedDraft.schedOutPeriod);
                                                                updateEditorDraft({
                                                                    schedOut: next.time,
                                                                    schedOutPeriod: next.period,
                                                                    clearSchedule: false,
                                                                });
                                                            }}
                                                            className="w-[5ch] min-w-[5ch] py-3 font-bold text-sm md:text-base bg-transparent outline-none"
                                                            maxLength={5}
                                                        />
                                                        <div className="ml-auto flex shrink-0 items-center gap-2">
                                                            <button type="button" onClick={() => updateEditorDraft({ schedOutPeriod: 'AM', clearSchedule: false })} className={`text-xs md:text-sm font-bold ${activeSelectedDraft.schedOutPeriod === 'AM' ? 'text-[#060606]' : 'text-gray-400 hover:text-gray-500'}`}>AM</button>
                                                            <button type="button" onClick={() => updateEditorDraft({ schedOutPeriod: 'PM', clearSchedule: false })} className={`text-xs md:text-sm font-bold ${activeSelectedDraft.schedOutPeriod === 'PM' ? 'text-[#060606]' : 'text-gray-400 hover:text-gray-500'}`}>PM</button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="field-label block mb-2">Status</label>
                                                    <select
                                                        value={activeSelectedDraft.clearSchedule ? DEFAULT_ADMIN_SCHEDULE_STATUS : normalizeAdminScheduleStatus(activeSelectedDraft.scheduleStatus)}
                                                        onChange={e => updateEditorDraft({ scheduleStatus: e.target.value, clearSchedule: false })}
                                                        className="w-full brutal-input px-3 py-3 font-bold text-sm md:text-base"
                                                    >
                                                        <option value="Draft">Draft</option>
                                                        <option value="Published">Published</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto] gap-3 items-end mt-4">
                                                <div>
                                                    <label className="field-label block mb-2">Template Name</label>
                                                    <input
                                                        type="text"
                                                        value={templateName}
                                                        onChange={e => onTemplateNameChange && onTemplateNameChange(e.target.value)}
                                                        placeholder="Morning Shift"
                                                        className="w-full brutal-input px-3 py-3 font-bold text-sm md:text-base"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={clearEditorForm}
                                                    className="brutal-btn bg-white px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
                                                >
                                                    <i className="fas fa-eraser text-[#f59e0b]"></i>
                                                    <span>Clear Form</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSaveTemplate}
                                                    disabled={!canSaveTemplate || isSavingTemplates}
                                                    className="brutal-btn bg-[#dbeafe] hover:bg-[#bfdbfe] px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
                                                >
                                                    <i className={`fas ${isSavingTemplates ? 'fa-circle-notch spinner' : 'fa-bookmark'}`}></i>
                                                    <span>{isSavingTemplates ? 'Saving Template...' : 'Save as Template'}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSaveShift}
                                                    disabled={!canSaveEditorDraft}
                                                    className="brutal-btn bg-[#4ade80] hover:bg-[#22c55e] px-4 py-3 text-sm md:text-base text-[#060606] flex items-center justify-center gap-2"
                                                >
                                                    <i className="fas fa-save"></i>
                                                    <span>Save Shift</span>
                                                </button>
                                            </div>

                                            <p className="section-subtitle mt-3">
                                                Save Shift stages this card on the week board. Use Save All at the top when you are ready to publish the whole week.
                                            </p>
                                        </div>

                                        <div className="section-card bg-[#eff6ff] p-4 mt-4">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <h5 className="card-title">Quick Templates</h5>
                                                    <p className="section-subtitle mt-1">Apply a saved shift or stage a removal in one click.</p>
                                                </div>
                                                <div className="card-meta">{quickActionCount} quick action{quickActionCount === 1 ? '' : 's'}</div>
                                            </div>

                                            <div className="card-grid mt-4">
                                                {[ADMIN_SHIFT_UTILITY_TEMPLATE, ...visibleTemplates].map(template => (
                                                    <button
                                                        key={template.id}
                                                        type="button"
                                                        onClick={() => applyTemplateToEditorDraft(template)}
                                                        disabled={isSavingTemplates}
                                                        className={`brutal-btn card-frame card-size-1x1 ${template.accent || 'bg-white'} p-3 text-left flex flex-col justify-between`}
                                                    >
                                                        <div>
                                                            <div className="card-title text-sm">{template.label}</div>
                                                            <div className="card-meta mt-2">
                                                                {template.clearSchedule ? 'Stage this shift for removal' : `${template.schedIn} - ${template.schedOut}`}
                                                            </div>
                                                        </div>
                                                        <div className="card-eyebrow text-[#060606]/70">
                                                            {template.clearSchedule ? 'Utility' : normalizeAdminScheduleStatus(template.scheduleStatus)}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        // --- MAIN APP COMPONENT ---
