import Image from "next/image";
import Link from "next/link";
import { assetPath } from "../lib/sitePaths";

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.7" r="1" className="social-icon__dot" /></svg>;
}

function YouTubeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 7.2a3 3 0 0 0-2.1-2.1C17 4.6 12 4.6 12 4.6s-5 0-6.9.5A3 3 0 0 0 3 7.2 31 31 0 0 0 2.6 12 31 31 0 0 0 3 16.8a3 3 0 0 0 2.1 2.1c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.8 31 31 0 0 0-.4-4.8Z" /><path d="m10 15.3 5.2-3.3L10 8.7Z" className="social-icon__play" /></svg>;
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top shell">
        <div className="footer__brand">
          <Image className="footer__logo" src={assetPath("/brand/logo-wordmark-light.svg")} alt="Yunnan Unfolded" width={430} height={190} />
          <p>Thoughtful, locally rooted journeys through Yunnan, China.</p>
          <div className="footer__socials" aria-label="Social media">
            <span className="footer__social-link footer__social-link--pending" aria-label="Instagram link coming soon" title="Instagram link coming soon"><InstagramIcon /><span>Instagram</span></span>
            <span className="footer__social-link footer__social-link--pending" aria-label="YouTube link coming soon" title="YouTube link coming soon"><YouTubeIcon /><span>YouTube</span></span>
          </div>
        </div>
        <div><p className="footer__label">Explore</p><nav><Link href="/journeys">Journeys</Link><Link href="/walk-yunnan">Walk Yunnan</Link><Link href="/travel-guides">Travel Guides</Link></nav></div>
        <div><p className="footer__label">About</p><nav><Link href="/about">Our Story</Link><Link href="/plan-my-trip">Plan My Trip</Link></nav></div>
        <div><p className="footer__label">Write to us</p><a className="footer__email" href="mailto:hello@yunnanunfolded.com">hello@yunnanunfolded.com</a><p className="footer__domain">yunnanunfolded.com</p></div>
      </div>
    </footer>
  );
}
