export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top shell">
        <div className="footer__brand"><p className="footer__wordmark">Yunnan <em>Unfolded</em></p><p>Thoughtful, locally rooted journeys through Yunnan, China.</p></div>
        <div><p className="footer__label">Explore</p><nav><Link href="/journeys">Journeys</Link><Link href="/walk-yunnan">Walk Yunnan</Link><Link href="/travel-guides">Travel Guides</Link></nav></div>
        <div><p className="footer__label">About</p><nav><Link href="/about">Our Story</Link><Link href="/plan-my-trip">Plan My Trip</Link></nav></div>
        <div><p className="footer__label">Write to us</p><a className="footer__email" href="mailto:hello@yunnanunfolded.com">hello@yunnanunfolded.com</a><p className="footer__domain">yunnanunfolded.com</p></div>
      </div>
      <div className="footer__bottom shell"><span>© {new Date().getFullYear()} Yunnan Unfolded</span><span>Terms · Privacy</span><span>Made close to the mountains</span></div>
    </footer>
  );
}
import Link from "next/link";
