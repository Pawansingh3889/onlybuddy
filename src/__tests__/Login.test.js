import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';

// ── Mock Firebase so no real network calls are made ──────────
jest.mock('../firebase', () => ({ auth: {}, db: {}, storage: {} }));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn((_auth, cb) => { cb(null); return () => {}; }),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// ── Mock AuthContext — Login needs login/signup functions ─────
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    signup: jest.fn(),
    currentUser: null,
    userRole: null,
    loading: false,
  }),
}));

// ── Mock useNavigate ──────────────────────────────────────────
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

import Login from '../Login';

const renderLogin = () =>
  render(
    <ThemeProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </ThemeProvider>
  );

describe('Login page', () => {
  test('renders Sign In tab by default', () => {
    renderLogin();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test('switches to Sign Up mode', () => {
    renderLogin();
    fireEvent.click(screen.getByText(/create account/i));
    expect(screen.getByText(/join onlybuddy/i)).toBeInTheDocument();
  });

  test('shows error when submitting empty login form', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in to onlybuddy/i }));
    expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
  });

  test('shows inline error for invalid email format', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/your@email\.com/i);
    fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    fireEvent.blur(emailInput);
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  test('shows inline password mismatch error when passwords differ', () => {
    renderLogin();
    fireEvent.click(screen.getByText(/create account/i));

    const passInputs = screen.getAllByPlaceholderText(/••••••••/);
    fireEvent.change(passInputs[0], { target: { value: 'Password1!' } });
    fireEvent.change(passInputs[1], { target: { value: 'Different1!' } });

    // The inline error renders immediately — no submit needed
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
