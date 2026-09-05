import React from 'react';

export default function UpdateShelterModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  onSupplyChange,
  onMarkAllAdequate
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#30475E]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-xl flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Update Status & Supplies</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form id="updateShelterForm" onSubmit={onSubmit} className="space-y-6">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Manager Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Manager Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00ADB5]" 
                    value={formData.managerName} 
                    onChange={e => setFormData({...formData, managerName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contact Phone</label>
                  <input 
                    type="tel" 
                    className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00ADB5]" 
                    value={formData.contactPhone} 
                    onChange={e => setFormData({...formData, contactPhone: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Occupants</label>
                <input 
                  type="number" 
                  min="0" 
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#00ADB5]" 
                  value={formData.occupantCount} 
                  onChange={e => setFormData({...formData, occupantCount: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Capacity</label>
                <input 
                  type="number" 
                  min="1" 
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#00ADB5]" 
                  value={formData.capacity} 
                  onChange={e => setFormData({...formData, capacity: e.target.value})} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                <h3 className="font-bold text-slate-800 text-sm">Update Supply Needs</h3>
                <button
                  disabled={formData.criticalSupplies.every(sup => sup.status === 'ADEQUATE')}
                  type="button" 
                  onClick={onMarkAllAdequate}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition"
                >
                  ✓ Mark All Adequate
                </button>
              </div>

              <div className="space-y-2">
                {formData.criticalSupplies.map((sup, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-white p-2 border border-slate-200 rounded-lg shadow-sm">
                    <span className="flex-1 text-sm font-semibold text-slate-700 truncate" title={sup.category}>{sup.category}</span>
                    <select 
                      className="border border-slate-200 p-2 text-sm rounded-lg bg-white w-28 md:w-32 focus:outline-none focus:border-[#00ADB5]" 
                      value={sup.status} 
                      onChange={e => onSupplyChange(idx, 'status', e.target.value)}
                    >
                      <option value="CRITICAL">🔴 Critical</option>
                      <option value="LOW">🟠 Low</option>
                      <option value="ADEQUATE">🟢 Adequate</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Qty needed" 
                      className="border border-slate-200 p-2 text-sm rounded-lg w-24 focus:outline-none focus:border-[#00ADB5]" 
                      value={sup.quantityNeeded || ''} 
                      onChange={e => onSupplyChange(idx, 'quantityNeeded', e.target.value)} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition">Cancel</button>
          <button form="updateShelterForm" type="submit" className="px-5 py-2.5 bg-[#30475E] hover:bg-[#2b4055] text-white rounded-xl text-sm font-bold shadow-md transition">Save Updates</button>
        </div>
      </div>
    </div>
  );
}