import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Member, EventItem, EventRegistration, Product, Payment, AuthUser } from './types';
import { storage } from './services/storage';
import { googleWorkspaceSync } from './services/googleWorkspaceSync';
import { BANUARASA_ASSETS, BARA_ASSETS } from './assets/baraAssets';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { MemberDashboard } from './components/MemberDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StandMapModal } from './components/StandMapModal';
import { PaymentModal } from './components/PaymentModal';
import { DigitalMemberCardModal } from './components/DigitalMemberCardModal';
import { QRScannerModal } from './components/QRScannerModal';
import { PaymentProofViewerModal } from './components/PaymentProofViewerModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { RegisterMemberModal } from './components/RegisterMemberModal';
import { AuthModal } from './components/AuthModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { BaraMascotWidget } from './components/BaraMascotWidget';
import { SplashIntroModal } from './components/SplashIntroModal';
import { BarcodeGeneratorModal } from './components/BarcodeGeneratorModal';
import { UserCheck, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  // Current logged in user session
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => storage.getCurrentUser());
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const u = storage.getCurrentUser();
    return u ? u.role : 'PUBLIC';
  });
  const [activeTab, setActiveTab] = useState<string>('landing');

  const [currentMember, setCurrentMember] = useState<Member | null>(() => {
    const u = storage.getCurrentUser();
    if (u?.member_id) {
      return storage.getMemberById(u.member_id) || null;
    }
    return null;
  });

  // Modals state
  const [isSplashIntroOpen, setIsSplashIntroOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'MEMBER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER'>('MEMBER_LOGIN');
  const [isGoogleWorkspaceModalOpen, setIsGoogleWorkspaceModalOpen] = useState(false);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePasswordTargetMember, setChangePasswordTargetMember] = useState<Member | null>(null);
  const [isSuperAdminResettingMember, setIsSuperAdminResettingMember] = useState(false);

  const [isStandMapOpen, setIsStandMapOpen] = useState(false);
  const [selectedEventForMap, setSelectedEventForMap] = useState<EventItem | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalParams, setPaymentModalParams] = useState<{
    registration?: EventRegistration;
    paymentType?: any;
    defaultAmount?: number;
  }>({});

  const [isDigitalCardOpen, setIsDigitalCardOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [selectedMemberForBarcode, setSelectedMemberForBarcode] = useState<Member | null>(null);
  const [inspectingPayment, setInspectingPayment] = useState<Payment | null>(null);
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [isRegisterMemberOpen, setIsRegisterMemberOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleOpenBarcodeModal = (member?: Member | null) => {
    setSelectedMemberForBarcode(member || currentMember || storage.getMembers()[0] || null);
    setIsBarcodeModalOpen(true);
  };

  // Manual or background sync with Google Apps Script / Spreadsheet
  const handleRefreshData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsRefreshing(true);
      await storage.syncWithServer();
      await googleWorkspaceSync.fetchAllDataFromGas();
    } catch (err) {
      console.warn('Auto-refresh data error:', err);
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, []);

  // Sync state when storage changes
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      const u = storage.getCurrentUser();
      setCurrentUser(u);
      if (u) {
        setCurrentRole(u.role);
        if (u.member_id) {
          const m = storage.getMemberById(u.member_id);
          setCurrentMember(m || null);
        } else {
          setCurrentMember(null);
        }
      } else {
        setCurrentRole('PUBLIC');
        setCurrentMember(null);
      }
    });
    return unsub;
  }, []);

  // Real-time synchronization: fast polling (3s) for local/server shared state + background GAS refresh (15s)
  useEffect(() => {
    // Initial sync
    handleRefreshData(true);

    // Fast 3s server sync for immediate updates across all phones & computers
    const fastSyncTimer = setInterval(() => {
      storage.syncWithServer();
    }, 3000);

    // Background 15s Google Apps Script sync
    const gasSyncTimer = setInterval(() => {
      googleWorkspaceSync.fetchAllDataFromGas();
    }, 15000);

    // Re-sync immediately when user switches tabs or wakes phone
    const handleFocus = () => {
      storage.syncWithServer();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(fastSyncTimer);
      clearInterval(gasSyncTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [handleRefreshData]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'SUPER_ADMIN') {
      setActiveTab('admin-dashboard');
    } else {
      if (user.member_id) {
        const m = storage.getMemberById(user.member_id);
        if (m) setCurrentMember(m);
      }
      setActiveTab('member-dashboard');
    }
  };

  const handleRegisterSuccess = (member: Member, user: AuthUser) => {
    setCurrentMember(member);
    setCurrentUser(user);
    setCurrentRole('MEMBER');
    setActiveTab('member-dashboard');
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setCurrentRole('PUBLIC');
    setActiveTab('landing');
  };

  const handleOpenStandMap = (event: EventItem) => {
    setSelectedEventForMap(event);
    setIsStandMapOpen(true);
  };

  const handleOpenPaymentModal = (params: {
    registration?: EventRegistration;
    paymentType?: any;
    defaultAmount?: number;
  }) => {
    setPaymentModalParams(params);
    setIsPaymentModalOpen(true);
  };

  const handleBookingSuccess = (reg: EventRegistration) => {
    setActiveTab('member-dashboard');
    handleOpenPaymentModal({
      registration: reg,
      paymentType: 'EVENT_PARTICIPATION',
      defaultAmount: reg.stand_price,
    });
  };

  const handleOpenChangePassword = (targetMember?: Member | null, isReset?: boolean) => {
    setChangePasswordTargetMember(targetMember || null);
    setIsSuperAdminResettingMember(!!isReset);
    setIsChangePasswordOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Bento Grid Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        onRoleChange={(r) => {
          setCurrentRole(r);
          if (r === 'PUBLIC') {
            handleLogout();
          }
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentMember={currentMember}
        onOpenMemberCard={() => setIsDigitalCardOpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        onOpenBarcodeModal={handleOpenBarcodeModal}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode || 'MEMBER_LOGIN');
          setIsAuthModalOpen(true);
        }}
        onOpenGoogleModal={() => setIsGoogleWorkspaceModalOpen(true)}
        onOpenSplashIntro={() => setIsSplashIntroOpen(true)}
        onOpenChangePassword={() => handleOpenChangePassword(null, false)}
        onLogout={handleLogout}
        onRefresh={() => handleRefreshData(false)}
        isRefreshing={isRefreshing}
      />

      {/* Main Responsive Canvas */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* HOMEPAGE / LANDING: Public Landing Page of Koperasi & Weekend Market */}
        {activeTab === 'landing' && (
          <LandingPage
            currentUser={currentUser}
            currentMember={currentMember}
            onOpenAuthModal={(mode) => {
              setAuthModalMode(mode);
              setIsAuthModalOpen(true);
            }}
            onOpenStandMap={handleOpenStandMap}
            onNavigateTab={setActiveTab}
            onOpenBarcodeModal={handleOpenBarcodeModal}
            onOpenGoogleModal={() => setIsGoogleWorkspaceModalOpen(true)}
            onOpenSplashIntro={() => setIsSplashIntroOpen(true)}
            onSelectProduct={(p) => setInspectingProduct(p)}
            onRefresh={() => handleRefreshData(false)}
            isRefreshing={isRefreshing}
          />
        )}

        {/* MEMBER AREA (Role Protected) */}
        {(activeTab === 'member-dashboard' ||
          activeTab === 'member-events' ||
          activeTab === 'member-savings') && (
          <>
            {currentUser && currentUser.role === 'MEMBER' && currentMember ? (
              <MemberDashboard
                member={currentMember}
                onOpenStandMap={handleOpenStandMap}
                onOpenPaymentModal={handleOpenPaymentModal}
                onOpenDigitalCard={() => setIsDigitalCardOpen(true)}
                onOpenChangePassword={() => handleOpenChangePassword(null, false)}
                onOpenBarcodeModal={handleOpenBarcodeModal}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm max-w-md mx-auto space-y-4 my-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">Area Anggota UMKM</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Silakan masuk atau daftarkan akun anggota UMKM Anda terlebih dahulu untuk mengakses dashboard anggota, sewa stand, dan KTA digital.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setAuthModalMode('MEMBER_LOGIN');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Masuk ke Akun
                  </button>
                  <button
                    onClick={() => setActiveTab('landing')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ADMIN DASHBOARD (Role Protected) */}
        {activeTab === 'admin-dashboard' && (
          <>
            {currentUser &&
            (currentUser.role === 'SUPER_ADMIN' ||
              currentUser.role === 'ADMIN_KOPERASI' ||
              currentUser.role === 'ADMIN_EVENT') ? (
              <AdminDashboard
                adminId={currentUser.id || 'ADM-SUPER'}
                onOpenPaymentInspector={(p) => setInspectingPayment(p)}
                onOpenQRScanner={() => setIsQRScannerOpen(true)}
                onOpenStandMap={handleOpenStandMap}
                onOpenGoogleWorkspaceModal={() => setIsGoogleWorkspaceModalOpen(true)}
                onOpenChangePassword={(targetMember, isReset) => handleOpenChangePassword(targetMember, isReset)}
                onOpenBarcodeModal={handleOpenBarcodeModal}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm max-w-md mx-auto space-y-4 my-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">Akses Dibatasi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Halaman ini hanya dapat diakses oleh akun pengurus yang telah terotentikasi.
                </p>
                <button
                  onClick={() => setActiveTab('landing')}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-950 border border-amber-400 p-0.5 shrink-0 flex items-center justify-center">
              <img
                src={BANUARASA_ASSETS.logo}
                alt="Logo Banua Rasa"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-slate-800">BANUARASA WEEKEND MARKET</span>
              <span className="mx-1.5 text-slate-400">•</span>
              <span className="text-emerald-700 font-bold">Koperasi Berau Melangkah Bersama</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Ecosystem Koperasi + UMKM + Google Workspace Architecture • 64 Stand
          </p>
        </div>
      </footer>

      {/* Modals */}
      <SplashIntroModal
        isOpen={isSplashIntroOpen}
        onClose={() => setIsSplashIntroOpen(false)}
        onOpenRegister={() => {
          setIsSplashIntroOpen(false);
          setAuthModalMode('REGISTER');
          setIsAuthModalOpen(true);
        }}
        onOpenLogin={() => {
          setIsSplashIntroOpen(false);
          setAuthModalMode('MEMBER_LOGIN');
          setIsAuthModalOpen(true);
        }}
      />

      {isStandMapOpen && selectedEventForMap && (
        <StandMapModal
          isOpen={isStandMapOpen}
          onClose={() => setIsStandMapOpen(false)}
          event={selectedEventForMap}
          currentMember={currentMember}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {isPaymentModalOpen && currentMember && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          currentMember={currentMember}
          registration={paymentModalParams.registration}
          paymentType={paymentModalParams.paymentType || 'EVENT_PARTICIPATION'}
          defaultAmount={paymentModalParams.defaultAmount || 50000}
          onSuccess={() => {
            // Updated via storage subscribe
          }}
        />
      )}

      {isDigitalCardOpen && currentMember && (
        <DigitalMemberCardModal
          isOpen={isDigitalCardOpen}
          onClose={() => setIsDigitalCardOpen(false)}
          member={currentMember}
          onOpenBarcodeModal={handleOpenBarcodeModal}
        />
      )}

      {isBarcodeModalOpen && (
        <BarcodeGeneratorModal
          isOpen={isBarcodeModalOpen}
          onClose={() => setIsBarcodeModalOpen(false)}
          initialMember={selectedMemberForBarcode || currentMember || undefined}
        />
      )}

      {isQRScannerOpen && (
        <QRScannerModal
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          adminId={currentUser?.id || 'ADM-EVENT'}
        />
      )}

      {inspectingPayment && (
        <PaymentProofViewerModal
          isOpen={!!inspectingPayment}
          onClose={() => setInspectingPayment(null)}
          payment={inspectingPayment}
          adminId={currentUser?.id || 'ADM-SUPER'}
          onProcessed={() => setInspectingPayment(null)}
        />
      )}

      {inspectingProduct && (
        <ProductDetailModal
          isOpen={!!inspectingProduct}
          onClose={() => setInspectingProduct(null)}
          product={inspectingProduct}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setIsAuthModalOpen(false);
            handleLoginSuccess(user);
          }}
          onRegisterSuccess={(member, user) => {
            setIsAuthModalOpen(false);
            handleRegisterSuccess(member, user);
          }}
        />
      )}

      {isGoogleWorkspaceModalOpen && (
        <GoogleWorkspaceModal
          isOpen={isGoogleWorkspaceModalOpen}
          onClose={() => setIsGoogleWorkspaceModalOpen(false)}
        />
      )}

      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => {
            setIsChangePasswordOpen(false);
            setChangePasswordTargetMember(null);
            setIsSuperAdminResettingMember(false);
          }}
          currentUser={currentUser}
          targetMember={changePasswordTargetMember}
          isSuperAdminReset={isSuperAdminResettingMember}
          onSuccess={() => {
            // Storage triggers notify and updates state automatically
          }}
        />
      )}

      {isRegisterMemberOpen && (
        <RegisterMemberModal
          isOpen={isRegisterMemberOpen}
          onClose={() => setIsRegisterMemberOpen(false)}
          onSuccess={(newM) => {
            setCurrentMember(newM);
            const authUser: AuthUser = {
              id: newM.member_id,
              username: newM.email,
              name: newM.nama_lengkap,
              role: 'MEMBER',
              member_id: newM.member_id,
              email: newM.email,
              foto_profil_url: newM.foto_profil_url,
              nomor_anggota: newM.nomor_anggota,
              nama_usaha: newM.nama_usaha,
            };
            storage.setCurrentUser(authUser);
            setCurrentUser(authUser);
            setCurrentRole('MEMBER');
            setActiveTab('member-dashboard');
          }}
        />
      )}

      {/* Floating Interactive Bara Mascot Guide */}
      <BaraMascotWidget
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode || 'MEMBER_LOGIN');
          setIsAuthModalOpen(true);
        }}
        onOpenSplashIntro={() => setIsSplashIntroOpen(true)}
      />
    </div>
  );
};

export default App;
