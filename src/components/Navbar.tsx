'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

interface NavbarProps {
  /** Override the logo link destination */
  homeHref?: string;
}

export default function Navbar({ homeHref = '/' }: NavbarProps) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    router.push('/login');
  }

  const isActive = (href: string) =>
    pathname === href ? { color: 'var(--electric)' } : undefined;

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <Link href={profile ? '/dashboard' : homeHref} className="navbar-logo" aria-label="CrowdFlow Home">
        ⚡ CrowdFlow
      </Link>

      <div className="navbar-actions">
        {!loading && profile ? (
          <>
            {profile.role === 'admin' && (
              <Link
                href="/admin"
                className="btn btn-ghost btn-sm"
                style={isActive('/admin')}
                aria-current={pathname === '/admin' ? 'page' : undefined}
              >
                🛡 Admin
              </Link>
            )}
            <Link
              href="/queue"
              className="btn btn-ghost btn-sm"
              style={isActive('/queue')}
              aria-label="View live queue"
            >
              📍 Queue
            </Link>
            <button
              onClick={handleSignOut}
              className="btn btn-ghost btn-sm"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </>
        ) : !loading ? (
          <>
            <Link href="/login"    className="btn btn-ghost btn-sm">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}
