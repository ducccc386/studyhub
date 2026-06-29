import React, { useState } from 'react';

// --- MOCK DATA ---
const MOCK_ACCOUNTS = [
  { id: 'A001', name: 'Nguyß╗àn Thß╗ï Thu', email: 'thu.nguyen@example.com', role: 'Gia s╞░', status: 'Hoß║ít ─æß╗Öng', joinedAt: '12/10/2023', avatar: 'https://i.pravatar.cc/150?u=thu' },
  { id: 'A002', name: 'Trß║ºn Minh Tuß║Ñn', email: 'tuan.tran@example.com', role: 'Phß╗Ñ huynh', status: 'Hoß║ít ─æß╗Öng', joinedAt: '15/10/2023', avatar: 'https://i.pravatar.cc/150?u=tuan' },
  { id: 'A003', name: 'L├¬ Anh Khoa', email: 'khoa.le@example.com', role: 'Gia s╞░', status: 'Bß╗ï kh├│a', joinedAt: '01/11/2023', avatar: 'https://i.pravatar.cc/150?u=khoa' },
  { id: 'A004', name: 'Phß║ím Mai H╞░╞íng', email: 'huong.pham@example.com', role: 'Phß╗Ñ huynh', status: 'Hoß║ít ─æß╗Öng', joinedAt: '20/11/2023', avatar: 'https://i.pravatar.cc/150?u=huong' },
  { id: 'A005', name: 'V┼⌐ ─Éß╗⌐c Ph├ít', email: 'phat.vu@example.com', role: 'Gia s╞░', status: 'Chß╗¥ duyß╗çt', joinedAt: '05/12/2023', avatar: 'https://i.pravatar.cc/150?u=phat' },
];

const AdminUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ekyc' | 'accounts'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-[1440px] mx-auto pb-20 animate-fade-in">
      {/* Page Header & Tabs */}
      <div className="mb-8 animate-slide-up">
        <h2 className="font-headline-lg text-headline-lg md:text-headline-xl md:font-headline-xl text-on-surface mb-6 font-bold text-[#0f172a]">
          Quß║ún l├╜ Ng╞░ß╗¥i d├╣ng & eKYC
        </h2>
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('ekyc')}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'ekyc' ? 'text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Duyß╗çt hß╗ô s╞í Gia s╞░
            {activeTab === 'ekyc' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'accounts' ? 'text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Quß║ún l├╜ T├ái khoß║ún
            {activeTab === 'accounts' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
          </button>
        </div>
      </div>

      {/* =========================================================================
                                 TAB: QUß║óN L├¥ T├ÇI KHOß║óN
      ========================================================================= */}
      {activeTab === 'accounts' && (
        <div className="animate-slide-up stagger-1 space-y-6">
          
          {/* Filters & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3 w-full sm:w-[320px] bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="T├¼m t├¬n, email, ID..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select className="bg-white border border-slate-200 rounded-xl text-sm text-slate-600 px-4 py-2.5 outline-none font-medium shadow-sm w-full sm:w-auto cursor-pointer">
                <option>Tß║Ñt cß║ú vai tr├▓</option>
                <option>Gia s╞░</option>
                <option>Phß╗Ñ huynh</option>
              </select>
              <select className="bg-white border border-slate-200 rounded-xl text-sm text-slate-600 px-4 py-2.5 outline-none font-medium shadow-sm w-full sm:w-auto cursor-pointer">
                <option>Tß║Ñt cß║ú trß║íng th├íi</option>
                <option>Hoß║ít ─æß╗Öng</option>
                <option>Bß╗ï kh├│a</option>
                <option>Chß╗¥ duyß╗çt</option>
              </select>
              <button className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/25">
                <span className="material-symbols-outlined text-[20px] block">filter_list</span>
              </button>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ng╞░ß╗¥i d├╣ng</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vai tr├▓</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trß║íng th├íi</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ng├áy tham gia</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao t├íc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_ACCOUNTS.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={acc.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
                          <div>
                            <p className="text-sm font-bold text-[#0f172a] group-hover:text-primary transition-colors">{acc.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{acc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          acc.role === 'Gia s╞░' 
                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {acc.role === 'Gia s╞░' ? 'school' : 'family_home'}
                          </span>
                          {acc.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            acc.status === 'Hoß║ít ─æß╗Öng' ? 'bg-emerald-500' :
                            acc.status === 'Bß╗ï kh├│a' ? 'bg-red-500' : 'bg-amber-500'
                          }`}></span>
                          <span className={`text-xs font-bold ${
                            acc.status === 'Hoß║ít ─æß╗Öng' ? 'text-emerald-700' :
                            acc.status === 'Bß╗ï kh├│a' ? 'text-red-700' : 'text-amber-700'
                          }`}>
                            {acc.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {acc.joinedAt}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Xem chi tiß║┐t">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Chß╗ënh sß╗¡a">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {acc.status === 'Bß╗ï kh├│a' ? (
                            <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Mß╗ƒ kh├│a">
                              <span className="material-symbols-outlined text-[18px]">lock_open</span>
                            </button>
                          ) : (
                            <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Kh├│a t├ái khoß║ún">
                              <span className="material-symbols-outlined text-[18px]">lock</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-medium text-slate-500">Hiß╗ân thß╗ï 1-5 cß╗ºa 120 t├ái khoß║ún</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded-lg text-slate-400 hover:bg-white hover:text-primary border border-transparent hover:border-slate-200 shadow-sm disabled:opacity-30">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/25">1</button>
                <button className="w-7 h-7 rounded-lg text-slate-600 hover:bg-white hover:text-primary border border-transparent hover:border-slate-200 shadow-sm text-xs font-bold">2</button>
                <button className="w-7 h-7 rounded-lg text-slate-600 hover:bg-white hover:text-primary border border-transparent hover:border-slate-200 shadow-sm text-xs font-bold">3</button>
                <button className="p-1 rounded-lg text-slate-400 hover:bg-white hover:text-primary border border-transparent hover:border-slate-200 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
                                 TAB: DUYß╗åT EKYC
      ========================================================================= */}
      {activeTab === 'ekyc' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-slide-up stagger-1">
          {/* Left Column: Verification Queue */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col h-[800px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0">
                <h3 className="font-bold text-lg text-[#0f172a]">H├áng chß╗¥ duyß╗çt</h3>
                <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">12 Chß╗¥</span>
              </div>
              <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {/* Queue Item 1 (Active) */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 cursor-pointer transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">NT</div>
                      <div>
                        <p className="font-bold text-sm text-[#0f172a]">Nguyß╗àn Thß╗ï Thu</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">To├ín ΓÇó Thß║íc s─⌐</p>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Chß╗¥ duyß╗çt</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right font-medium">─É├ú nß╗Öp 2 giß╗¥ tr╞░ß╗¢c</p>
                </div>
                {/* Queue Item 2 */}
                <div className="p-4 rounded-xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:text-primary group-hover:bg-primary/10 transition-colors">TM</div>
                      <div>
                        <p className="font-bold text-sm text-[#0f172a] group-hover:text-primary transition-colors">Trß║ºn Minh</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Vß║¡t l├╜ ΓÇó Kß╗╣ s╞░</p>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Chß╗¥ duyß╗çt</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right font-medium">─É├ú nß╗Öp 5 giß╗¥ tr╞░ß╗¢c</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed View */}
          <div className="xl:col-span-8">
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden h-[800px] flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              {/* Profile Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-5 items-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-4 border-white shadow-sm">
                    NT
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-[#0f172a] mb-1">Nguyß╗àn Thß╗ï Thu</h2>
                    <p className="text-sm font-medium text-slate-500 mb-2.5">thu.nguyen@example.com ΓÇó 0912 345 678</p>
                    <div className="flex gap-2">
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-bold">To├ín</span>
                      <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-bold">Khoa hß╗ìc</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-[#0f172a] transition-colors shadow-sm">
                    Y├¬u cß║ºu th├¬m
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 hover:border-red-200 transition-colors shadow-sm">
                    Tß╗½ chß╗æi
                  </button>
                  <button className="flex-1 md:flex-none px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/25 active:scale-95">
                    Duyß╗çt hß╗ô s╞í
                  </button>
                </div>
              </div>
              
              {/* Documents Canvas */}
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-amber-600">badge</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">X├íc minh danh t├¡nh</p>
                      <p className="text-sm font-bold text-amber-600 mt-0.5">Cß║ºn xem x├⌐t</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-amber-600">school</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Bß║▒ng cß║Ñp</p>
                      <p className="text-sm font-bold text-amber-600 mt-0.5">Cß║ºn xem x├⌐t</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-emerald-600">policy</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-emerald-600/70 uppercase tracking-wide">L├╜ lß╗ïch t╞░ ph├íp</p>
                      <p className="text-sm font-bold text-emerald-700 mt-0.5">─É├ú v╞░ß╗út qua</p>
                    </div>
                  </div>
                </div>

                {/* Document Sections */}
                <div className="space-y-8">
                  {/* ID Document */}
                  <div>
                    <h4 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">id_card</span> Giß║Ñy tß╗¥ tuß╗│ th├ón
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="aspect-[1.6/1] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 relative overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400">
                          <span className="material-symbols-outlined text-4xl mb-2 group-hover:scale-110 transition-transform">image</span>
                          <span className="text-xs font-medium">CCCD_MatTruoc.jpg</span>
                        </div>
                        <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer">
                          <button className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-primary shadow-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">zoom_in</span> Xem to├án m├án h├¼nh
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Loß║íi giß║Ñy tß╗¥</p>
                          <p className="text-sm font-semibold text-[#0f172a]">C─ân c╞░ß╗¢c c├┤ng d├ón</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">T├¬n tr├¡ch xuß║Ñt (OCR)</p>
                          <p className="text-sm font-semibold text-[#0f172a]">Nguyß╗àn Thß╗ï Thu</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">─Éß╗Ö ch├¡nh x├íc (AI)</p>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[92%]"></div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600">92%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
