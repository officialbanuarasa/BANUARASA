import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { MemberDashboard } from './components/MemberDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { StandMapModal } from './components/StandMapModal';
import { PaymentModal } from './components/PaymentModal';
import { DigitalMemberCardModal } from './components/DigitalMemberCardModal';
import { QRScannerModal } from './components/QRScannerModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { RegisterMemberModal } from './components/RegisterMemberModal';
import { BaraMascotWidget } from './components/BaraMascotWidget';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { EditorialDetailModal } from './components/EditorialDetailModal';

import { storage } from './services/storage';
import { 
  Member, 
  EventItem, 
  Registration, 
  Payment, 
  Saving, 
  SalesReport, 
  Product, 
  DocumentRecord, 
  AuditLog, 
  AuthSession 
} from './types';

export function App() {
  // Session & Auth state
  const [session, setSession] = useState<AuthSession | null>(() => storage.getSession());
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  // Core Data Cache
  const [members, setMembers] = useState<Member[]>(() => storage.getMembers());
  const [events, setEvents] = useState<EventItem[]>(() => storage.getEvents());
  const [registrations, setRegistrations] = useState<Registration[]>(() => storage.getRegistrations());
  const [payments, setPayments] = useState<Payment[]>(() => storage.getPayments());
  const [savings, setSavings] = useState<Saving[]>(() => storage.getSavings());
  const [salesReports, setSalesReports] = useState<SalesReport[]>(() => storage.getSalesReports());
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => storage.getDocuments());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());

  // Modal Control States
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isStandMapOpen, setIsStandMapOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isRegisterMemberOpen, setIsRegisterMemberOpen] = useState<boolean>(false);
  const [isGoogleWorkspaceOpen, setIsGoogleWorkspaceOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedEditorialId, setSelectedEditorialId] = useState<string | null>(null);

  // Active view routing
  const [currentView, setCurrentView] = useState<'home' | 'member' | 'admin'>('home');

  useEffect(() => {
    if (session?.user?.member_id) {
      const found = storage.getMemberById(session.user.member_id);
      if (found) {
        setCurrentMember(found);
      }
    } else {
      setCurrentMember(null);
    }
  }, [session, members]);

  const refreshLocalState = () => {
    setMembers([...storage.getMembers()]);
    setEvents([...storage.getEvents()]);
    setRegistrations([...storage.getRegistrations()]);
    setPayments([...storage.getPayments()]);
    setSavings([...storage.getSavings()]);
    setSalesReports([...storage.getSalesReports()]);
    setProducts([...storage.getProducts()]);
    setDocuments([...storage.getDocuments()]);
    setAuditLogs([...storage.getAuditLogs()]);
  };

  const handleLoginSuccess = (newSession: AuthSession) => {
    storage.setSession(newSession);
    setSession(newSession);
    setIsAuthOpen(false);

    if (newSession.user.role === 'MEMBER') {
      setCurrentView('member');
    } else if (['SUPER_ADMIN', 'ADMIN_KOPERASI', 'ADMIN_EVENT'].includes(newSession.user.role)) {
      setCurrentView('admin');
    }
  };

  const handleLogout = () => {
    storage.clearSession();
    setSession(null);
    setCurrentMember(null);
    setCurrentView('home');
    storage.logActivity('LOGOUT', 'AUTH', 'Pengguna keluar dari aplikasi');
    refreshLocalState();
  };

  const activeEvent = useMemo(() => {
    return events.find(e => e.status === 'UPCOMING' || e.status === 'ONGOING') || events[0] || null;
  }, [events]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        session={session}
        currentMember={currentMember}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onNavigateHome={() => setCurrentView('home')}
        onNavigateMember={() => setCurrentView('member')}
        onNavigateAdmin={() => setCurrentView('admin')}
        onOpenGoogleWorkspace={() => setIsGoogleWorkspaceOpen(true)}
        onOpenRegisterMember={() => setIsRegisterMemberOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <LandingPage
            events={events}
            products={products}
            onOpenStandMap={() => setIsStandMapOpen(true)}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            onSelectEditorial={(id) => setSelectedEditorialId(id)}
            onOpenRegisterMember={() => setIsRegisterMemberOpen(true)}
          />
        )}

        {currentView === 'member' && session?.user?.role === 'MEMBER' && (
          <MemberDashboard
            session={session}
            member={currentMember}
            registrations={registrations.filter(r => r.member_id === session.user.member_id)}
            payments={payments.filter(p => p.member_id === session.user.member_id)}
            savings={savings.filter(s => s.member_id === session.user.member_id)}
            salesReports={salesReports.filter(sr => sr.member_id === session.user.member_id)}
            products={products.filter(p => p.member_id === session.user.member_id)}
            documents={documents.filter(d => d.member_id === session.user.member_id)}
            onOpenStandMap={() => setIsStandMapOpen(true)}
            onOpenPayment={() => setIsPaymentOpen(true)}
            onOpenCardModal={() => setIsCardModalOpen(true)}
            onOpenChangePassword={() => setIsChangePasswordOpen(true)}
            onDataUpdated={refreshLocalState}
          />
        )}

        {currentView === 'admin' && session && ['SUPER_ADMIN', 'ADMIN_KOPERASI', 'ADMIN_EVENT'].includes(session.user.role) && (
          <AdminDashboard
            session={session}
            members={members}
            events={events}
            registrations={registrations}
            payments={payments}
            savings={savings}
            salesReports={salesReports}
            documents={documents}
            auditLogs={auditLogs}
            onDataUpdated={refreshLocalState}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}
      </main>

      <BaraMascotWidget />

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onOpenRegister={() => {
            setIsAuthOpen(false);
            setIsRegisterMemberOpen(true);
          }}
        />
      )}

      {isStandMapOpen && (
        <StandMapModal
          isOpen={isStandMapOpen}
          onClose={() => setIsStandMapOpen(false)}
          activeEvent={activeEvent}
          currentMember={currentMember}
          onBookingSuccess={() => {
            refreshLocalState();
            setIsStandMapOpen(false);
            if (session?.user?.role === 'MEMBER') {
              setIsPaymentOpen(true);
            }
          }}
        />
      )}

      {isPaymentOpen && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          member={currentMember}
          registrations={registrations.filter(r => r.member_id === session?.user?.member_id)}
          onPaymentSuccess={() => {
            refreshLocalState();
            setIsPaymentOpen(false);
          }}
        />
      )}

      {isCardModalOpen && currentMember && (
        <DigitalMemberCardModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          member={currentMember}
        />
      )}

      {isScannerOpen && (
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={(data) => {
            refreshLocalState();
            console.log('Barcode hasil scan:', data);
          }}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      )}

      {isRegisterMemberOpen && (
        <RegisterMemberModal
          isOpen={isRegisterMemberOpen}
          onClose={() => setIsRegisterMemberOpen(false)}
          onRegisterSuccess={() => {
            refreshLocalState();
            setIsRegisterMemberOpen(false);
          }}
        />
      )}

      {isGoogleWorkspaceOpen && (
        <GoogleWorkspaceModal
          isOpen={isGoogleWorkspaceOpen}
          onClose={() => setIsGoogleWorkspaceOpen(false)}
        />
      )}

      {selectedEditorialId && (
        <EditorialDetailModal
          editorialId={selectedEditorialId}
          isOpen={!!selectedEditorialId}
          onClose={() => setSelectedEditorialId(null)}
        />
      )}
    </div>
  );
}

export default App;
