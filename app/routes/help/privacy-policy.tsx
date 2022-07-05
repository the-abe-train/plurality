import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";

export default function () {
  return (
    <main className="flex-grow px-4 mx-auto mb-4 max-w-4xl my-4 overflow-x-">
      <AnimatedBanner text="Privacy Policy" />
      <div className="flex flex-col md:flex-row-reverse my-4">
        <section className="w-4/5 space-y-3">
          <h2 className="text-2xl font-header">Disclaimer</h2>
          <p>
            When you see ads on Plurality, they are being distributed by{" "}
            <a href="https://www.snack-media.com/" className="underline">
              Snack Media
            </a>{" "}
            via{" "}
            <a
              href="https://support.google.com/admanager/answer/6022000?hl=en"
              className="underline"
            >
              Google Ad Manager
            </a>
            . Excerpts from Snack Media's Privacy Policy that pertain to
            Plurlaity are laid out below. To read the entire policy, check out
            their website{" "}
            <a
              className="underline"
              href="https://www.snack-media.com/privacy-policy"
            >
              here
            </a>
            .
          </p>
          <h2 className="text-2xl font-header">Policy</h2>
          <ol className="space-y-2 list-decimal list-inside">
            <li>
              <a href="#section1">Our Data Promise to you</a>
            </li>
            <li>
              <a href="#section2">Who does this privacy notice apply to?</a>
            </li>
            <li>
              <a href="#section3">What data do we collect?</a>
            </li>
            <li>
              <a href="#section4">How do we keep it secure?</a>
            </li>
            <li>
              <a href="#section5">How do we collect Personal Data?</a>
            </li>
            <li>
              <a href="#section6">How do we use your Personal Data?</a>
            </li>
            <li>
              <a href="#section7">Who we share your data with</a>
            </li>
            <li>
              <a href="#section8">How long is your information kept?</a>
            </li>
            <li>
              <a href="#section9">Cookies and how we use them</a>
            </li>
            <li>
              <a href="#section10">Online Behavioural Advertising</a>
            </li>
          </ol>
          <h3 className="text-lg font-bold" id="section1">
            1. Our Data Promise to you
          </h3>
          <p>
            Plurality will process personal information only in strict
            compliance with the Data Protection Act 2018 (as amended), the
            Privacy and Electronic Communications (EC Directive) Regulations
            2003 and other associated data protection legislation. Your visiting
            this web site constitutes acceptance of and consent to the practices
            set out in this Privacy Policy. If you do not agree with any of the
            terms as set out in this Privacy Policy then you should cease using
            this web site immediately.
          </p>
          <p>
            Plurality reserves the rights to change this Privacy Policy at any
            time by posting an updated version on the web site. The date that
            the web site was last updated is shown at the bottom of this web
            page. Your continued use of this site after an updated version is
            posted constitutes your acceptance of and consent to the practices
            set out in this Privacy Policy as modified.
          </p>
          <h3 className="text-lg" id="section2">
            2. Who does this privacy notice apply to?
          </h3>
          <p>This notice applies to:</p>
          <ul className="list-disc list-inside">
            <li>Players who visit the site without making an account.</li>
            <li>Players who make an account on Plurality.</li>
          </ul>
          <h3 className="text-lg" id="section3">
            3. What data do we collect?
          </h3>
          <p>
            We collect both non-personal and personal data on an ongoing basis.
            Personal:
          </p>
          <ul className="list-disc list-inside">
            <li>IP address</li>
            <li>Email address</li>
            <li>Telephone number</li>
            <li>Address</li>
            <li>Demographic details</li>
            <li>
              Behavioural data (what you are interacting with on our site)
            </li>
            <li>Device data (e.g. Phone, desktop, tablet)</li>
          </ul>
          <p>Non-personal:</p>
          <p>
            Web browser details, operating system data, date and time stamps,
            clothing &amp; accessory size information
          </p>
          <h3 className="text-lg" id="section4">
            4. How do we keep it secure?
          </h3>
          <p>
            We maintain appropriate organisational and technological safeguards
            to help protect against unauthorised use, access to or accidental
            loss, alteration or destruction of the personal data we hold. We
            also seek to ensure our third-party service providers do the same.
            However, the transmission of data over the Internet cannot be
            guaranteed to be completely secure and failsafe. As such, SN&amp;CK
            Media Limited is not able to warrant or guarantee the complete
            security of any personal information that you provide and it is
            important that you are aware that providing any such information is
            done so entirely at your own risk
          </p>
          <h3 className="text-lg" id="section5">
            5. How do we collect Personal Data?
          </h3>
          <ul className="list-disc list-inside">
            <li>
              Directly from you, when you sign up for our services and when you
              browse one of our sites
            </li>
            <li>
              Personal data we generate about you, e.g. personal data we use to
              authenticate you, or personal data in the form of your IP address
              or your preferences
            </li>
            <li>
              Personal data we collect from third parties, e.g. personal data
              that helps us to combat fraud or which we collect, with your
              permission, when you interact with your social media accounts
            </li>
            <li>
              Personal data that we hold on to to perform our duties as a
              processor like hosting of websites and our services.
            </li>
          </ul>
          <p>
            Your personal information is not collected from you automatically,
            simply as a result of your accessing this web site other than some
            information about your device or IP for identification to ensure
            correct tracking and analysis and to combat fraudulent activity.
          </p>
          <h3 className="text-lg" id="section6">
            6. How do we use your Personal Data?
          </h3>
          <p>
            We use personal data collected through our sites and apps only when
            we have a valid reason and the legal grounds to do so. We determine
            the legal grounds based on the purposes for which we have collected
            your personal data. The legal ground may be one of the following:
          </p>
          <ul className="list-disc list-inside">
            <li>
              <em>
                Performance of a contract with you (or in order to take steps
                prior to entering into a contract with you)
              </em>
              : For example, where you have purchased a product from us and we
              need to use your contact details and payment data in order to
              process your order and deliver your product.
            </li>
            <li>
              <em>Compliance with law</em>: In some cases, we may have a legal
              obligation to use or keep your personal data.
            </li>
            <li>
              <em>Our legitimate interests</em>: Where it is necessary for us to
              understand our readers, promote our services and operate our sites
              and apps efficiently for the creation, publication and
              distribution of content online. Examples of when we rely on our
              legitimate interests to use your personal data include:
            </li>
          </ul>
          <ol className="list-decimal list-inside">
            <li>
              When we analyse what content has been viewed on our sites, so that
              we can understand how they are used and improve our content
            </li>
            <li>
              To carry out marketing analyses to better understand your
              interests and preferences so that we can make our marketing more
              relevant to your interests and preferences. This includes when we
              promote our own products and services. For example, we look at
              what you have viewed on our sites or what products have bought You
              can opt out from having your personal data used for marketing
              analyses by sending me a DM on
              <a className="underline" href="https://twitter.com/theAbeTrain">
                Twitter
              </a>
              , or through the form on my{" "}
              <a className="underline" href="https://the-abe-train.com">
                personal website.
              </a>
            </li>
            <li>
              To show you personalised advertising by identifying your interests
              and to create “segments” of particular types of audiences so that
              we may show you advertisements that may be more relevant to your
              interests and the ‘’segments’’ you may be in. These ‘’segments’’
              are also used to inform the building of custom audiences so that
              we can identify our audience across third party websites, such as
              social media platforms like Facebook.
            </li>
            <li>
              To collect and log IP addresses to improve the website and monitor
              website usage
            </li>
            <li>
              To personalise our services (for example, so you can sign in) by
              remembering your settings, and recognising you when you sign in on
              different devices
            </li>
            <li>When responding to your queries and to resolve complaints</li>
            <li>
              For security and fraud prevention, and to ensure that our sites
              and apps are safe and secure and used in line with our terms of
              use
            </li>
          </ol>
          <h3 className="text-lg" id="section7">
            7. Who we share your data with
          </h3>
          <p>
            We use third-party advertising companies to serve ads when you visit
            our Web site. These companies may use aggregated information (not
            including your name, address, email address or telephone number)
            about your visits to this and other Web sites in order to provide
            advertisements about goods and services of interest to you. If you
            would like more information about this practice and to know your
            choices about not having this information used by these companies,
            please see:{" "}
            <a href="http://www.networkadvertising.org/managing/opt_out.asp">
              http://www.networkadvertising.org/managing/opt_out.asp
            </a>
          </p>
          <p>
            All the information that Plurality sites collect via the web site or
            correspondence is used to help Plurality understand more about who
            uses the web site and to help improve the web site and the services
            that it offers. It will also help Plurality to send communications
            to you that may be of interest.
          </p>
          <p>
            We do share information about users with third parties order to
            promote, sell or enhance the products and services we provide but we
            only disclose such information in an aggregated or anonymised form
            so that the information is incapable of identifying you as an
            individual, unless you have given us prior consent to do so. We take
            the privacy of our users very seriously, we do not rent, sell or
            share your personal data with other people without gaining your
            consent to do so. However, in limited circumstances, your personal
            data may be passed to a third party in any one of these
            circumstances without explicit consent:-
          </p>
          <ul className="list-disc list-inside">
            <li>
              If Plurality has a duty to do so or if the law allows or requires
              Plurality to do so;
            </li>
            <li>
              If Plurality or its assets are sold to or purchased by another
              company or person;
            </li>
            <li>
              To affiliated businesses or subsidiary or parent companies of
              Plurality.
            </li>
            <li>
              <strong>
                If Plurality wishes to or is required to pass on your
                information to a third party in these limited circumstances, it
                will send an email notice and give you the opportunity to
                opt-out.
              </strong>
            </li>
          </ul>
          <p>
            Plurality may use the personal information that you have provided to
            contact you by any of the methods which you input. If you have
            provided us with your email, you will be added to Plurality
            newsletter database and you will receive content, news and
            additional information about new services, features or products from
            the site your signed up via in the Plurality group and other sites
            within Plurality group. If you do not want to be contacted in this
            way then please click where indicated when you are completing any of
            the online forms where you initially input your personal details, by
            changing your personal details on the [“personal details”] page when
            you are logged on to the web site, or by contacting Plurality via
            the contact page at any time after submitting your personal details.
          </p>
          <p>
            As the Internet is a global network, there may be instances when
            your personal data travels across international borders. This may
            include transfers outside the EU and the EEA. If you do voluntarily
            input any personal information via this web site or send
            correspondence, then in doing so you are authorising Plurality
            Limited to transfer your personal data in this way.
          </p>
          <h3 className="text-lg" id="section8">
            8. How long is your information kept?
          </h3>
          <p>
            We will keep your personal information for as long as is necessary
            for the purposes listed above (section 6.) or longer, as may be
            required by law. Generally, we will keep your personal information
            for 6 years from collection. However, in practice the retention
            period will likely be shorter if the information is no longer needed
            or longer if required for lawful purposes.
          </p>
          <p>
            After the retention period, your personal data will either be
            securely deleted or anonymised and it may be used for analytical
            purposes. You must back up your data if you wish to keep it for
            longer.
          </p>
          <h3 className="text-lg" id="section9">
            9. Cookies and how we use them
          </h3>
          <p>
            Cookies&#8221; are small pieces of information that a website sends
            to your computer&#8217;s hard drive while you are viewing a website.
            We uses cookies for a number of reasons:
          </p>
          <ul className="list-disc list-inside">
            <li>
              To provide you with a more personal and interactive experience on
              our sites.
            </li>
            <li>
              For statistical purposes to track how many users we have and how
              often they visit our websites.
            </li>
            <li>
              We use organisation to collect anonymous user information so they
              can analyse how the website is being used and the number of
              visitors.
            </li>
            <li>
              We and our advertisers may use statistical cookies to track who
              has seen an advert and clicked on it.
            </li>
            <li>
              To show you adverts that you may be interested in and to control
              the number of time you see them and measures the effectiveness of
              the ad campaign.
            </li>
            <li>
              We may use ‘Flash’ cookies to store your preference for your media
              player. If we do not use them, it may not be possible for you to
              watch some video content.
            </li>
            <li>
              You have the ability to accept or decline cookies, when you use
              the website for the first time via “see all options” link on the
              “pop up” banner, but please be aware that for some parts of our
              sites to work, you will need to accept cookies.
            </li>
            <li>
              For more information about third party cookies generated by
              advertisers, please visit www.allaboutcookies.org and/or{" "}
              <a href="http://www.youronlinechoices.com">
                youronlinechoices.com
              </a>
            </li>
          </ul>
          <p>Types of Cookies</p>
          <p>FUNCTIONALITY COOKIES</p>
          <p>
            These are essential to the running of a Snack Media owned website.
            They include Session cookies, which enable you to carry out
            essential functions on Snack Media owned websites like maintaining
            login details for the session or a transaction. Session cookies are
            not stored on your computer and the information these cookies
            collect is anonymised and they cannot track your browsing activity
            on other website. These cookies will expire when you close your web
            browser session.
          </p>
          <p>
            Cookies defined, as ‘Functionality’ will not be used to target you
            with adverts on other websites.
          </p>
          <p>STRICTLY NECESSARY COOKIES</p>
          <p>
            These cookies allow you to move around our websites and use
            essential features like secure areas and shopping baskets. These
            cookies do not gather any information about you that could be used
            for marketing or remembering where you have been on the internet.
          </p>
          <p>
            Cookies defined, as ‘Strictly Necessary’ will not be used to target
            you with adverts or remember your preference or username beyond your
            current visit.
          </p>
          <p>PERFORMANCE COOKIES</p>
          <p>
            These cookies collect information about how you use our website,
            such as which pages you visit. These cookies do not collect any
            information that could identify you, as all the information
            collected is anonymous and is only used to help us improve our
            websites, understand what interests you and measures how effective
            our advertising is.
          </p>
          <p>
            Cookies defined, as ‘Performance’ will not be used to target you
            with adverts or target adverts to you on other websites, or remember
            your preference or username beyond your current visit. We use these
            cookies to understand how our website is performing to enable us to
            make improvements to enhance your browsing experience.
          </p>
          <p>TARGETING COOKIES</p>
          <p>
            These cookies are linked to services provided by third parties. We
            use these cookies for social media sharing; providing advertising
            agencies with information on your visit so that they can show you
            adverts that you may be interested in when you return to the website
            or visit other third party websites and deliver content and
            marketing communication which are tailored to your interests based
            on you your visit. We also enable some advertising partners to set
            cookies specifically to enable them to analyse advertising campaign
            performance.
          </p>
          <p>
            We may also use cookies and similar technologies to provide you with
            adverts based on your location, offers you click on, and other
            similar interactions with our websites and apps.
          </p>
          <p>THIRD PARTY COOKIES</p>
          <p>
            Some third party sites may drop cookies on your device with consent
            or with legitimate interest
          </p>
          <p>Cookies set by Plurality and its partners</p>
          <table className="max-w-full break-words">
            <tbody>
              <tr>
                <td>
                  <strong>Cookie Group</strong>
                </td>
                <td>
                  <strong>Cookie Type(s)</strong>
                </td>
                <td>
                  <strong>Purposes</strong>
                </td>
                <td>
                  <strong>Cookie Info</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>WordPress &#8211; *wp*</strong>
                  <strong>*wordpress*</strong>
                </td>
                <td>
                  <strong>Strictly Necessary, Functional</strong>
                </td>
                <td>
                  <strong>
                    Logging into the website, sessions and commenting{" "}
                  </strong>
                </td>
                <td>
                  <a href="https://wordpress.org/support/article/cookies/">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Google Analytics</strong>
                </td>
                <td>
                  <strong>Performance, Analytics</strong>
                </td>
                <td>
                  <strong>Tracking impressions and user behaviour</strong>
                </td>
                <td>
                  <a href="https://developers.google.com/analytics/devguides/collection/gtagjs/cookie-usage">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Google Ads</strong>
                </td>
                <td>
                  <strong>Advertistings, Analytics, Targeting</strong>
                </td>
                <td>
                  <strong>
                    Ad targeting, personalisation, tracking and analytics
                  </strong>
                </td>
                <td>
                  <a href="https://business.safety.google/adscookies/">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Sourcepoint</strong>
                </td>
                <td>
                  <strong>Performance, Analytics</strong>
                </td>
                <td>
                  <strong>
                    For Consent management platform and user options of GDPR and
                    CCPA{" "}
                  </strong>
                </td>
                <td>
                  <a href="https://documentation.sourcepoint.com/implementation/general/cookies-and-local-storage">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Hubspot</strong>
                </td>
                <td>
                  <strong>Performance, Analytics</strong>
                </td>
                <td>
                  <strong>Website usage and tracking</strong>
                </td>
                <td>
                  <a href="https://knowledge.hubspot.com/reports/what-cookies-does-hubspot-set-in-a-visitor-s-browser">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Lotame</strong>
                </td>
                <td>
                  <strong>Performance, Analytics, Targeting</strong>
                </td>
                <td>
                  <strong>
                    User targeting, behaviour tracking, and audience matching.
                  </strong>
                </td>
                <td>
                  <a href="https://www.lotame.com/about-lotame/privacy/">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>JEENG</strong>
                </td>
                <td>
                  <strong>Performance, Analytics</strong>
                </td>
                <td>
                  <strong>Push notification analytics tracking</strong>
                </td>
                <td>
                  <a href="https://www.jeeng.com/privacy-policy/">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Parsley</strong>
                </td>
                <td>
                  <strong>Performance, Analytics</strong>
                </td>
                <td>
                  <strong>
                    Website analytics tracking for impression information{" "}
                  </strong>
                </td>
                <td>
                  <a href="https://www.parse.ly/privacy-policy">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Quantcast</strong>
                </td>
                <td>
                  <strong>Analytics, Targeting</strong>
                </td>
                <td>
                  <strong>
                    For Consent management platform and user options of GDPR and
                    CCPA
                  </strong>
                </td>
                <td>
                  <a href="https://www.quantcast.com/faq/quantcast-services/">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Xenforo</strong>
                </td>
                <td>
                  <strong>Strictly Necessary, Functional, performance</strong>
                </td>
                <td>
                  <strong>
                    Logging into forums, settings and personalisation
                  </strong>
                </td>
                <td>
                  <a href="https://xenforo.com/community/help/cookies/">link</a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>PhpBB</strong>
                </td>
                <td>
                  <strong>Strictly Necessary, Functional</strong>
                </td>
                <td>
                  <strong>
                    Logging into forums, settings and personalisation
                  </strong>
                </td>
                <td>
                  <a href="https://www.phpbb.com/community/viewtopic.php?t=2428331">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Prebid</strong>
                </td>
                <td>
                  <strong>Performance, Analytics, Targeting</strong>
                </td>
                <td>
                  <strong>
                    Headerbidding cookies to record preferences for advertising
                    and vendor tracking{" "}
                  </strong>
                </td>
                <td>
                  <a href="https://docs.prebid.org/cookies.html#cookie-declaration">
                    <strong>link</strong>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-lg" id="section10">
            10. Online Behavioural Advertising
          </h3>
          <p>
            <em>
              We use an advertising service called online behavioural
              advertising (OBA). This allows us to deliver targeted advertising
              to the visitors of our websites. It works by showing you adverts
              that are based on your browsing patterns and the way you have
              interacted with the website. For example, if you have been reading
              a lot of car articles, you may be shown more adverts for cars.{" "}
            </em>
          </p>
          <p>With consent, we use data to:</p>
          <p>
            – analyse user cohorts and behaviours across our website; we build
            aggregated audiences around key attributes and behaviours.
          </p>
          <p>
            – facilitate targeted advertising on sites owned by Plurality
            limited to provide relevant advertisements to you and to make
            effective use of advertising inventory.
          </p>
          <p>
            We facilitate the above functions by using advertising technology
            providers:
          </p>
          <p>
            LOTAME <strong>–</strong> data management platform, for the purpose
            of gaining audience insights and enabling consented audience data to
            be activated through our advertising platforms. Lotame uses cookies
            and other identifiers to track online behavioural, demographic and
            technographic data; they don’t receive information such as your name
            and email. Lotame can also receive anonymous data segments that
            Snack Media sends, such as user IDs associated with people who have
            been registered members for a certain length of time. Lotame stores
            data on average for 9 months, and in special cases for up to 18
            months. Lotame’s privacy policy:
            <a href="https://www.lotame.com/about-lotame/privacy/lotames-products-services-privacy-policy/">
              https://www.lotame.com/about-lotame/privacy/lotames-products-services-privacy-policy/
            </a>
            .
          </p>
          <p>
            Liveramp <strong>–</strong> When you log into our website, we may
            share information that we collect from you, such as your email (in
            hashed, pseudonymous form), IP address, or information about your
            browser or operating system, with our partner LiveRamp. LiveRamp
            uses this information to create an online identification code for
            the purpose of recognizing you on your device. This code does not
            contain any of your identifiable personal data and cannot be used to
            re-identify you. We place this code in our cookie and allow it to be
            used for online and cross-channel advertising. It may be shared with
            our advertising partners and other third party advertising companies
            globally for the purpose of enabling interest-based content or
            targeted advertising throughout your online experience (e.g. web,
            email, connected devices, and in-app, etc). These third parties may
            in turn use this code to link demographic or interest-based
            information you have provided in your interactions with them. You
            have the right to express a choice regarding our sharing of this
            data with LiveRamp for the above purposes, of the creation of this
            code, or of our sharing of the code with our advertising partners.
          </p>
          <p>
            When you use our website, we share information that we may collect
            from you, such as your email (in hashed, de-identified form), IP
            address or information about your browser or operating system, with
            our partner, LiveRamp Inc and its group companies (‘LiveRamp’).
            LiveRamp may drop a cookie on your browser or directly in our emails
            and match your shared information to their on- and offline marketing
            databases and those of its advertising partners to create a link
            between your browser and information in those other databases.
            Similarly, when you use our mobile apps, we may also share hashed
            and de-identified email addresses, mobile device ID, location data,
            and advertising identifiers with LiveRamp, which uses that
            information to create a link between your mobile device and its
            databases. This link may be shared by our partners globally for the
            purpose of enabling interest-based content or advertising throughout
            your online experience (e.g. cross device, web, email and in app
            etc.) by third parties unaffiliated with our website. These third
            parties may in turn link further demographic or interest-based
            information to your browser. You have the right to exercise your
            rights under GDPR including opting out of LiveRamp’s Cookie or
            Mobile Identifiers and can easily do so by clicking on this link:{" "}
            <a href="https://your-rights.liveramp.uk/home" rel="nofollow">
              https://your-rights.liveramp.uk/home
            </a>
          </p>
          <p>
            <em>
              If you would like more information regarding OBA and how to opt
              out, visit{" "}
              <a href="http://www.youronlinechoices.com/uk/">
                http://www.youronlinechoices.com/uk/
              </a>
            </em>
          </p>
        </section>
        <InfoMenu page="privacy-policy" />
      </div>
    </main>
  );
}
