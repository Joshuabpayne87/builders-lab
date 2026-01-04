"use client";

import React, { useEffect } from 'react';

export default function JoinPage() {
  useEffect(() => {
    // FAQ Accordion logic
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(button => {
      button.addEventListener('click', () => {
        const isActive = button.classList.contains('active');
        questions.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          btn.nextElementSibling?.classList.remove('active');
        });
        if (!isActive) {
          button.classList.add('active');
          button.setAttribute('aria-expanded', 'true');
          button.nextElementSibling?.classList.add('active');
        }
      });
    });

    // Exit Intent Popup logic
    const exitPopup = document.getElementById('exitPopup');
    const closePopup = document.getElementById('closePopup');
    let popupShown = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !popupShown && exitPopup) {
        exitPopup.classList.add('visible');
        popupShown = true;
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    closePopup?.addEventListener('click', () => exitPopup?.classList.remove('visible'));
    exitPopup?.addEventListener('click', (e) => {
      if (e.target === exitPopup) exitPopup.classList.remove('visible');
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && exitPopup?.classList.contains('visible')) {
        exitPopup.classList.remove('visible');
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Smooth scroll for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = (e.currentTarget as HTMLElement).getAttribute('href');
        if (targetId && targetId !== '#') {
          const target = document.querySelector(targetId);
          target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="join-landing-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .join-landing-page {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #E8DCC4;
            color: #2d2d2d;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
        }

        .join-landing-page * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .join-landing-page h1, .join-landing-page h2, .join-landing-page h3, .join-landing-page h4, .join-landing-page h5, .join-landing-page h6 {
            color: #1a1a1a;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1rem;
        }

        .join-landing-page h1 { font-size: clamp(2rem, 5vw, 3.5rem); letter-spacing: -0.02em; }
        .join-landing-page h2 { font-size: clamp(1.75rem, 4vw, 2.5rem); letter-spacing: -0.01em; }
        .join-landing-page h3 { font-size: clamp(1.5rem, 3vw, 2rem); }
        .join-landing-page h4 { font-size: clamp(1.25rem, 2.5vw, 1.5rem); }
        .join-landing-page p { margin-bottom: 1rem; font-size: clamp(1rem, 2vw, 1.125rem); }
        .join-landing-page strong { color: #1a1a1a; font-weight: 700; }

        .join-landing-page .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .join-landing-page .section { padding: 4rem 0; border-bottom: 2px solid #1a1a1a; }
        .join-landing-page .section:last-of-type { border-bottom: none; }

        .join-landing-page .header-banner { width: 100%; height: auto; display: block; border-bottom: 4px solid #1a1a1a; }
        .join-landing-page .header-banner img { width: 100%; height: auto; display: block; }

        .join-landing-page .hero { padding: 5rem 0; text-align: center; }
        .join-landing-page .hero h1 { margin-bottom: 1.5rem; text-transform: uppercase; font-weight: 900; }
        .join-landing-page .hero .subheadline { font-size: clamp(1.125rem, 2.5vw, 1.5rem); margin-bottom: 2rem; color: #1a1a1a; font-weight: 600; }
        .join-landing-page .hero .description { font-size: clamp(1rem, 2vw, 1.25rem); max-width: 800px; margin: 0 auto 2rem; line-height: 1.7; }

        .join-landing-page .btn { display: inline-block; padding: 1rem 2.5rem; font-size: 1.125rem; font-weight: 700; text-decoration: none; border-radius: 4px; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; border: none; text-transform: uppercase; letter-spacing: 0.5px; }
        .join-landing-page .btn-primary { background-color: #C73E1D; color: #E8DCC4; box-shadow: 0 4px 0 #8b2a13; }
        .join-landing-page .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #8b2a13; }
        .join-landing-page .btn-primary:active { transform: translateY(2px); box-shadow: 0 2px 0 #8b2a13; }
        .join-landing-page .btn-secondary { background-color: #1a1a1a; color: #E8DCC4; box-shadow: 0 4px 0 #000; }
        .join-landing-page .btn-secondary:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #000; }
        .join-landing-page .btn-secondary:active { transform: translateY(2px); box-shadow: 0 2px 0 #000; }

        .join-landing-page .cta-container { text-align: center; margin-top: 2.5rem; }
        .join-landing-page .bonus-badge { display: inline-block; background-color: #1a1a1a; color: #E8DCC4; padding: 0.75rem 1.5rem; margin-top: 1rem; font-size: 0.9rem; font-weight: 600; border-radius: 4px; }

        .join-landing-page .email-form { max-width: 500px; margin: 2rem auto 0; }
        .join-landing-page .email-form input[type="email"] { width: 100%; padding: 1rem; font-size: 1rem; border: 2px solid #1a1a1a; border-radius: 4px; background-color: #fff; margin-bottom: 1rem; font-family: inherit; }
        .join-landing-page .email-form input[type="email"]:focus { outline: none; border-color: #C73E1D; box-shadow: 0 0 0 3px rgba(199, 62, 29, 0.1); }
        .join-landing-page .email-form button { width: 100%; }

        .join-landing-page .section-header { text-align: center; margin-bottom: 3rem; }
        .join-landing-page .section-header h2 { margin-bottom: 1rem; }

        .join-landing-page .problem-math { background-color: #1a1a1a; color: #E8DCC4; padding: 2rem; border-radius: 4px; margin: 2rem 0; }
        .join-landing-page .problem-math h3 { color: #E8DCC4; margin-bottom: 1.5rem; }
        .join-landing-page .problem-math p { color: #E8DCC4; font-size: 1.125rem; }
        .join-landing-page .problem-math strong { color: #C73E1D; }

        .join-landing-page .philosophy-quote { background-color: #C73E1D; color: #E8DCC4; padding: 2.5rem; margin: 2rem 0; border-left: 6px solid #1a1a1a; font-size: 1.25rem; font-weight: 600; font-style: italic; }

        .join-landing-page .layers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0; }
        .join-landing-page .layer-card { background-color: #fff; padding: 2rem; border: 3px solid #1a1a1a; border-radius: 4px; box-shadow: 6px 6px 0 #1a1a1a; }
        .join-landing-page .layer-card h3 { color: #C73E1D; margin-bottom: 1rem; text-transform: uppercase; font-size: 1.25rem; }
        .join-landing-page .layer-card ul { list-style: none; padding-left: 0; }
        .join-landing-page .layer-card ul li { padding-left: 1.5rem; position: relative; margin-bottom: 0.75rem; }
        .join-landing-page .layer-card ul li:before { content: "â†’"; position: absolute; left: 0; color: #C73E1D; font-weight: 700; }

        .join-landing-page .steps { counter-reset: step-counter; }
        .join-landing-page .step { counter-increment: step-counter; margin-bottom: 2.5rem; padding-left: 4rem; position: relative; }
        .join-landing-page .step:before { content: counter(step-counter); position: absolute; left: 0; top: 0; width: 3rem; height: 3rem; background-color: #C73E1D; color: #E8DCC4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; border: 3px solid #1a1a1a; }
        .join-landing-page .step h3 { margin-bottom: 0.5rem; }

        .join-landing-page .two-column { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; margin: 2rem 0; }
        .join-landing-page .column-box { background-color: #fff; padding: 2rem; border: 3px solid #1a1a1a; border-radius: 4px; }
        .join-landing-page .column-box h3 { color: #C73E1D; margin-bottom: 1.5rem; text-transform: uppercase; }
        .join-landing-page .column-box ul { list-style: none; padding-left: 0; }
        .join-landing-page .column-box ul li { padding-left: 1.5rem; position: relative; margin-bottom: 0.75rem; }
        .join-landing-page .column-box ul li:before { content: "âœ“"; position: absolute; left: 0; color: #C73E1D; font-weight: 900; }
        .join-landing-page .column-box.not-for ul li:before { content: "âœ—"; }

        .join-landing-page .pricing-card { background-color: #1a1a1a; color: #E8DCC4; padding: 3rem; border-radius: 4px; text-align: center; max-width: 600px; margin: 3rem auto; border: 4px solid #C73E1D; box-shadow: 8px 8px 0 #C73E1D; }
        .join-landing-page .pricing-card .price { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 900; color: #E8DCC4; margin: 1rem 0; }
        .join-landing-page .pricing-card .price-breakdown { font-size: 1.25rem; color: #E8DCC4; margin-bottom: 2rem; }
        .join-landing-page .pricing-card ul { text-align: left; list-style: none; padding-left: 0; margin: 2rem 0; }
        .join-landing-page .pricing-card ul li { padding-left: 2rem; position: relative; margin-bottom: 1rem; font-size: 1.125rem; color: #E8DCC4; }
        .join-landing-page .pricing-card ul li:before { content: "âœ“"; position: absolute; left: 0; color: #C73E1D; font-weight: 900; font-size: 1.5rem; }
        .join-landing-page .pricing-card .guarantee { color: #E8DCC4; font-size: 1rem; margin-top: 2rem; font-style: italic; }

        .join-landing-page .bonus-highlight { background-color: #C73E1D; color: #E8DCC4; padding: 2.5rem; border-radius: 4px; margin: 3rem 0; border: 4px solid #1a1a1a; text-align: center; }
        .join-landing-page .bonus-highlight h3 { color: #E8DCC4; font-size: clamp(1.5rem, 3vw, 2rem); margin-bottom: 1rem; text-transform: uppercase; }
        .join-landing-page .bonus-highlight p { color: #E8DCC4; font-size: 1.125rem; }

        .join-landing-page .video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 800px; margin: 2rem auto; background-color: #1a1a1a; border: 4px solid #1a1a1a; border-radius: 4px; }
        .join-landing-page .video-placeholder { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #E8DCC4; font-size: 1.25rem; font-weight: 600; }
        .join-landing-page .video-placeholder:before { content: "â–¶"; font-size: 4rem; margin-bottom: 1rem; color: #C73E1D; }

        .join-landing-page .faq-accordion { max-width: 900px; margin: 2rem auto; }
        .join-landing-page .faq-item { background-color: #fff; border: 3px solid #1a1a1a; margin-bottom: 1rem; border-radius: 4px; overflow: hidden; }
        .join-landing-page .faq-question { width: 100%; padding: 1.5rem; background-color: #1a1a1a; color: #E8DCC4; border: none; text-align: left; font-size: 1.125rem; font-weight: 700; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: inherit; transition: background-color 0.2s ease; }
        .join-landing-page .faq-question:hover { background-color: #2d2d2d; }
        .join-landing-page .faq-question:after { content: "+"; font-size: 2rem; font-weight: 900; color: #C73E1D; transition: transform 0.3s ease; }
        .join-landing-page .faq-question.active:after { transform: rotate(45deg); }
        .join-landing-page .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 1.5rem; }
        .join-landing-page .faq-answer.active { max-height: 500px; padding: 1.5rem; }
        .join-landing-page .faq-answer p { margin-bottom: 0; }

        .join-landing-page .decision-comparison { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0; }
        .join-landing-page .decision-box { padding: 2rem; border-radius: 4px; border: 4px solid #1a1a1a; }
        .join-landing-page .decision-box.dont-join { background-color: #2d2d2d; color: #E8DCC4; }
        .join-landing-page .decision-box.dont-join h3 { color: #C73E1D; }
        .join-landing-page .decision-box.dont-join p { color: #E8DCC4; }
        .join-landing-page .decision-box.do-join { background-color: #C73E1D; color: #E8DCC4; }
        .join-landing-page .decision-box.do-join h3 { color: #E8DCC4; }
        .join-landing-page .decision-box.do-join p { color: #E8DCC4; }

        .join-landing-page .footer { background-color: #1a1a1a; color: #E8DCC4; padding: 3rem 0; text-align: center; border-top: 4px solid #C73E1D; }
        .join-landing-page .footer p { color: #E8DCC4; margin-bottom: 0.5rem; }

        .join-landing-page .exit-popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.85); z-index: 9999; display: none; align-items: center; justify-content: center; animation: fadeIn 0.3s ease; }
        .join-landing-page .exit-popup-overlay.visible { display: flex; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .join-landing-page .exit-popup { background-color: #E8DCC4; border: 4px solid #1a1a1a; box-shadow: 12px 12px 0 #C73E1D; max-width: 500px; width: 90%; padding: 40px; position: relative; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .join-landing-page .exit-popup-close { position: absolute; top: 15px; right: 15px; background: #1a1a1a; color: #E8DCC4; border: none; width: 35px; height: 35px; font-size: 24px; line-height: 1; cursor: pointer; font-weight: 700; transition: all 0.2s ease; }
        .join-landing-page .exit-popup-close:hover { background-color: #C73E1D; transform: rotate(90deg); }
        .join-landing-page .exit-popup h3 { font-size: 28px; margin-bottom: 16px; color: #1a1a1a; text-align: center; }
        .join-landing-page .exit-popup p { font-size: 16px; margin-bottom: 24px; color: #2d2d2d; text-align: center; }

        /* MAILERLITE FORM STYLES */
        #mlb2-35300521.ml-form-embedContainer { box-sizing: border-box; display: table; margin: 0 auto; position: static; width: 100% !important; }
        #mlb2-35300521.ml-form-embedContainer .ml-form-embedWrapper { background-color: transparent; border-width: 0; border-style: solid; padding: 0; width: 100%; }
        #mlb2-35300521.ml-form-embedContainer .ml-form-embedBody, #mlb2-35300521.ml-form-embedContainer .ml-form-successBody { padding: 20px 20px 0; }
        #mlb2-35300521.ml-form-embedContainer .ml-form-embedBody .ml-form-embedContent h2 { font-size: 24px; font-weight: 700; margin: 0 0 10px; color: #1a1a1a; }
        #mlb2-35300521.ml-form-embedContainer .ml-form-embedBody form { margin: 0; width: 100%; }
        #mlb2-35300521.ml-form-embedContainer .ml-form-fieldRow input { background-color: #ffffff !important; border: 2px solid #1a1a1a !important; border-radius: 4px !important; color: #1a1a1a !important; font-size: 16px !important; padding: 14px 20px !important; width: 100% !important; }
        #mlb2-35300521.ml-form-embedContainer .ml-form-fieldRow button { background-color: #1a1a1a !important; border: 3px solid #1a1a1a !important; border-radius: 4px !important; color: #E8DCC4 !important; cursor: pointer; font-size: 18px !important; font-weight: 700 !important; padding: 14px 32px !important; width: 100% !important; transition: all 0.2s ease !important; }
        #mlb2-35300521.ml-form-embedContainer .ml-form-fieldRow button:hover { background-color: #C73E1D !important; border-color: #C73E1D !important; transform: translateY(-2px); box-shadow: 6px 6px 0 #1a1a1a; }
      ` }} />

      {/* HEADER BANNER */} 
      <header className="header-banner">
          <img src="https://storage.mlcdn.com/account_image/1387571/XeuQOU1ecl37yXEC68calZgG8pCAZ7mn1DefFpQE.png" alt="The Builders Lab - Soviet Propaganda Style Header" />
      </header>

      {/* SECTION 1: HERO */} 
      <section className="hero section">
          <div className="container">
              <h1>Stop Losing 10+ Hours a Month to Problems Someone Else Already Solved</h1>
              <p className="subheadline">That's a full workday. Every month. Forever.</p>
              <p className="description">
                  The Builders Lab is a membership for solo builders who are tired of being stuck alone. Get AI tools, a community of builders, and direct support for $49.99/month.        
              </p>
              <p className="description"><strong>Cancel anytime.</strong></p>

              <div className="cta-container">
                  <a href="https://topaitools.dev/#/portal/signup/6855cc19f0c9910008da8f33/monthly" className="btn btn-primary" style={{ marginBottom: '24px' }}>Join The Builders Lab - $49.99/month</a>
                  <span className="bonus-badge" style={{ display: 'block', marginBottom: '32px' }}>First 10 members get a free 1-hour 1-on-1 session ($175 value)</span>

                  <p style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#2d2d2d', textAlign: 'center' }}><strong>Or get The Builders Playbook first:</strong></p>

                  {/* MailerLite Embedded Form */} 
                  <div id="mlb2-35300521" className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-35300521" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <div className="ml-form-align-center">
                      <div className="ml-form-embedWrapper embedForm">
                        <div className="ml-form-embedBody ml-form-embedBodyDefault row-form">
                          <div className="ml-form-embedContent" style={{ textAlign: 'center' }}>
                            <h4 style={{ fontSize: '22px', marginBottom: '12px' }}>The Builders Playbook</h4>
                          </div>
                          <form className="ml-block-form" action="https://assets.mailerlite.com/jsonp/1387571/forms/175640406646588874/subscribe" method="post" target="_blank">   
                            <div className="ml-form-formContent">
                              <div className="ml-form-fieldRow ml-last-item">
                                <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                                  <input aria-label="email" aria-required="true" type="email" className="form-control" name="fields[email]" placeholder="Enter your email" autoComplete="email" />
                                </div>
                              </div>
                            </div>
                            <input type="hidden" name="ml-submit" value="1" />
                            <div className="ml-form-embedSubmit">
                              <button type="submit" className="primary">Get The Playbook</button>
                            </div>
                            <input type="hidden" name="anticsrf" value="true" />
                          </form>
                        </div>
                        <div className="ml-form-successBody row-success" style={{ display: 'none' }}>
                          <div className="ml-form-successContent">
                            <h4>Thank you!</h4>
                            <p>Check your email for The Builders Playbook.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
          </div>
      </section>

      {/* SECTION 2: THE PROBLEM */} 
      <section id="problem" className="section">
          <div className="container">
              <div className="section-header">
                  <h2>The Real Cost of Building Alone</h2>
              </div>
              <p>Let me show you what isolation actually costs.</p>
              <p>You hit a blocker. Maybe it's a marketing problem. Maybe it's technical. Maybe you just can't figure out the right approach.</p>
              <p>So you do what builders do: You try to solve it yourself.</p>
              <p>You Google. You watch tutorials. You try three different approaches. You walk away frustrated. You come back the next day and try again.</p>
              <p>Three days later, you've burned 15+ hours. The problem might be solved. Or you've found a workaround that will break later.</p>
              <p>Here's what you didn't see:</p>
              <p><strong>Someone else already solved this exact problem. They could have told you the answer in 15 minutes. But you didn't have access to them.</strong></p>

              <div className="problem-math">
                  <h3>The Math</h3>
                  <p>If your time is worth $50/hour (conservative for most builders), that 15-hour blocker cost you $750.</p>
                  <p>Most builders hit 2-4 of these per month.</p>
                  <p>That's $1,500-$3,000/month in stuck time. Every month. Forever. As long as you're building alone.</p>
                  <p><strong>Isolation isn't free. It's the most expensive subscription you're already paying for.</strong></p>
              </div>
          </div>
      </section>

      {/* SECTION 3: THE PHILOSOPHY */} 
      <section id="philosophy" className="section">
          <div className="container">
              <div className="section-header">
                  <h2>This Isn't a Course. It's Leverage.</h2>
              </div>
              <p>You don't have an information problem.</p>
              <p>You can find tutorials on anything. YouTube is free. Documentation exists. ChatGPT can explain concepts.</p>
              <p>But information doesn't solve problems. ACCESS does.</p>
              <p>The difference between a 3-day blocker and a 15-minute fix isn't knowledge. It's knowing someone who's already been there.</p>
              <p>That's what courses can't give you. A pre-recorded video can't look at your specific situation and say, "Oh, I hit this exact issue. Here's what actually worked."</p>     
              <p><strong>The Builders Lab isn't about learning more. It's about solving faster.</strong></p>

              <div className="philosophy-quote">
                  "Being stuck isn't a knowledge problem. It's a leverage problem. You don't need another course. You need a room full of people who've already solved what you're stuck on."
              </div>

              <h3>The Philosophy</h3>
              <p><strong>I teach what I build.</strong></p>
              <p>Everything inside is working production infrastructure. Real tools I use daily. Real systems that generate real results. Not theory I read about and repackaged.</p>       
              <p>When you ask a question, you're not getting generic advice. You're getting answers from people actively building the same things you are.</p>
              <p>Every successful builder has a network they tap into. The solo grind is a myth. The people you think "figured it out alone" had mentors, communities, and access you didn't see.</p>
          </div>
      </section>

      {/* SECTION 4: WHAT'S INSIDE */} 
      <section id="whats-inside" className="section">
          <div className="container">
              <div className="section-header">
                  <h2>What You Get Inside The Builders Lab</h2>
                  <p>Four layers of leverage for $49.99/month</p>
              </div>

              <div className="layers-grid">
                  <div className="layer-card">
                      <h3>Layer 1: AI Tools + Apps</h3>
                      <p>Working production tools. Not tutorials about tools. Actual applications for:</p>
                      <ul>
                          <li>Marketing automation</li>
                          <li>Content creation and repurposing</li>
                          <li>Building and development workflows</li>
                          <li>Business operations</li>
                      </ul>
                      <p>These are the same tools I use in my own business. You get access to the infrastructure, not a course about the infrastructure.</p>
                  </div>

                  <div className="layer-card">
                      <h3>Layer 2: Community of Builders</h3>
                      <p>Marketers. Developers. Founders. Creative professionals.</p>
                      <p>People who've already solved the problems you're stuck on. Ask a question. Get an answer from someone who's been there.</p>
                      <p>This isn't a Facebook group full of beginners asking the same questions. It's a room of practitioners.</p>
                  </div>

                  <div className="layer-card">
                      <h3>Layer 3: Ongoing Support</h3>
                      <p>Stuck on something? Ask.</p>
                      <ul>
                          <li>Technical problems</li>
                          <li>Marketing strategy</li>
                          <li>Social media approach</li>
                          <li>Building decisions</li>
                          <li>Content creation</li>
                      </ul>
                      <p>No waiting for office hours. No booking calls weeks out. Post your blocker. Get help.</p>
                  </div>

                  <div className="layer-card">
                      <h3>Layer 4: Systems + Templates</h3>
                      <p>When we solve a problem, we turn it into a repeatable system.</p>
                      <p>Templates. Workflows. SOPs. So you don't solve the same problem twice.</p>
                      <p>This compounds. Every month, the library of solved problems grows. Your leverage increases.</p>
                  </div>
              </div>

              <div className="bonus-highlight">
                  <h3>Bonus Access: Live Sessions</h3>
                  <p>When you hit a blocker that needs real-time help, we do sessions and calls.</p>
                  <p>Screen sharing. Walking through your specific situation. Not generic Q&A - actual problem-solving.</p>
              </div>
          </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */} 
      <section id="how-it-works" className="section">
          <div className="container">
              <div className="section-header">
                  <h2>How It Works</h2>
              </div>

              <div className="steps">
                  <div className="step">
                      <h3>Join</h3>
                      <p>Sign up at $49.99/month. No contracts. Cancel anytime. You get immediate access to everything.</p>
                  </div>
                  <div className="step">
                      <h3>Access the Tools</h3>
                      <p>Browse the AI tools and apps. Use what's relevant to your current projects. These are working applications, not tutorials.</p>
                  </div>
                  <div className="step">
                      <h3>Ask Your Questions</h3>
                      <p>Hit a blocker? Post it. The community and I will help you solve it. Most questions get useful responses within hours.</p>
                  </div>
                  <div className="step">
                      <h3>Implement the Systems</h3>
                      <p>Use the templates and workflows to turn solutions into repeatable processes. Stop solving the same problems repeatedly.</p>
                  </div>
                  <div className="step">
                      <h3>Compound Your Leverage</h3>
                      <p>Every month, you have more tools, more solved problems, more connections. Building gets easier over time, not harder.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* SECTION 6: WHO THIS IS FOR */} 
      <section id="who-this-is-for" className="section">
          <div className="container">
              <div className="section-header">
                  <h2>Who This Is For</h2>
              </div>

              <div className="two-column">
                  <div className="column-box for">
                      <h3>This is for you if:</h3>
                      <ul>
                          <li>You're a solo builder (developer, marketer, founder, creative professional)</li>
                          <li>You regularly hit blockers that eat hours or days of your time</li>
                          <li>You're tired of figuring everything out alone</li>
                          <li>You want working tools, not more courses</li>
                          <li>You value your time at more than $5/hour</li>
                      </ul>
                  </div>
                  <div className="column-box not-for">
                      <h3>This is NOT for you if:</h3>
                      <ul>
                          <li>You're looking for "get rich quick" schemes</li>
                          <li>You want someone to build your business for you</li>
                          <li>You're not actively building something</li>
                          <li>You're not willing to ask questions and engage</li>
                      </ul>
                  </div>
              </div>
              <p>This is a room for practitioners. People who are doing the work. If you're just browsing for motivation, this isn't the place.</p>
              <p>Serious builders understand that time is their most valuable asset. If you're still romanticizing the "figure it out yourself" struggle, you're competing against people who don't.</p>
          </div>
      </section>

      {/* SECTION 7: PRICING + BONUS */} 
      <section id="pricing" className="section">
          <div className="container">
              <div className="section-header">
                  <h2>Simple Pricing</h2>
              </div>

              <div className="pricing-card">
                  <div className="price">$49.99/month</div>
                  <p className="price-breakdown">That's $1.67/day. Less than a coffee.</p>
                  <p>But if it saves you even ONE hour per month, you're getting a 30x return on your time investment.</p>
                  <h4 style={{ color: '#E8DCC4', marginTop: '2rem' }}>What's included:</h4>
                  <ul>
                      <li>All AI tools and apps (current and future)</li>
                      <li>Full community access</li>
                      <li>Ongoing support for any blocker</li>
                      <li>All systems and templates</li>
                      <li>Access to live sessions</li>
                  </ul>
                  <p className="guarantee"><strong>No contracts. Cancel anytime.</strong></p>
                  <p className="guarantee">If it's not working for you, leave. No hard feelings. No cancellation fees. No "pause your subscription" games.</p>
                  <div className="cta-container">
                      <a href="https://topaitools.dev/#/portal/signup/6855cc19f0c9910008da8f33/monthly" className="btn btn-primary">Join Now - $49.99/month</a>
                  </div>
              </div>

              <div className="bonus-highlight">
                  <h3>First 10 Members: Free 1-Hour 1-on-1 Session</h3>
                  <p>Worth $175. We'll spend an hour solving your current biggest problem together.</p>
                  <p>One-on-one. Screen sharing if needed. Whatever you're stuck on right now - we fix it.</p>
                  <p><strong>This is only for the first 10 people who join. After that, the bonus is gone.</strong></p>
              </div>
          </div>
      </section>

      {/* SECTION 8: SOCIAL PROOF */} 
      <section id="social-proof" className="section">
          <div className="container">
              <div className="section-header">
                  <h2>What a Session Looks Like</h2>
              </div>
              <div className="video-container">
                  <div className="video-placeholder">
                      <span>Video of actual session where problem was solved</span>
                      <p style={{ marginTop: '1rem', fontSize: '1rem' }}>Real builders. Real problems. Real solutions.</p>
                  </div>
              </div>
              <p style={{ textAlign: 'center', marginTop: '2rem' }}>No scripted testimonials. Just the work.</p>
          </div>
      </section>

      {/* SECTION 9: FAQ */} 
      <section id="faq" className="section">
          <div className="container">
              <div className="section-header">
                  <h2>Questions You Might Have</h2>
              </div>

              <div className="faq-accordion">
                  {[ 
                    { q: "What if I don't use it enough to justify $50/month?", a: "If you solve ONE blocker that would have taken you 5+ hours, you've made your money back at almost any hourly rate. The membership pays for itself with a single solved problem." },
                    { q: "Is this just another community/Discord/Slack?", a: "No. Communities are just chat rooms. This is tools + support + systems. The community is one component. You also get working applications, templates, and direct access to help." },
                    { q: "What kinds of problems can I get help with?", a: "Marketing, technical/development, content creation, business strategy, AI implementation, automation, social media. If you're building something online and you're stuck, it's probably covered." },
                    { q: "How fast do questions get answered?", a: "Most questions get useful responses within hours. Complex problems might take longer, but you won't be waiting days." },
                    { q: "What if I'm a complete beginner?", a: "This works best for people who are actively building something. If you're brand new and don't have a project yet, you might not get full value immediately. That said, the tools and systems work at any level." },
                    { q: "Can I cancel anytime?", a: "Yes. No contracts. No cancellation fees. No \"talk to a retention specialist\" nonsense. Click cancel, you're done." }
                  ].map((faq, i) => (
                    <div key={i} className="faq-item">
                        <button className="faq-question" aria-expanded="false">
                            {faq.q}
                        </button>
                        <div className="faq-answer">
                            <p>{faq.a}</p>
                        </div>
                    </div>
                  ))}
              </div>
          </div>
      </section>

      {/* SECTION 10: THE DECISION */} 
      <section id="decision" className="section">
          <div className="container">
              <div className="section-header">
                  <h2>The Decision</h2>
              </div>

              <div className="decision-comparison">
                  <div className="decision-box dont-join">
                      <h3>Here's what happens if you don't join:</h3>
                      <p>Next week, you'll hit another blocker. You'll spend 8-12 hours on it. You'll either solve it the hard way or find a workaround that creates more problems later.</p>
                      <p>The week after that, it'll happen again.</p>
                      <p>In a year, you'll have lost 120+ hours to problems someone else already solved. That's three full work weeks. Gone.</p>
                      <p>And the membership will still be here. Same price. Same access. But you'll have paid the isolation tax for 12 more months.</p>
                  </div>
                  <div className="decision-box do-join">
                      <h3>Here's what happens if you join:</h3>
                      <p>Tomorrow, you can post your current biggest blocker. By end of week, it's probably solved.</p>
                      <p>You get access to every tool in the vault. You start using systems that turn one-time solutions into repeatable processes.</p>
                      <p>Every month, solving problems gets faster. Your leverage compounds.</p>
                  </div>
              </div>

              <div className="problem-math">
                  <h3>The math:</h3>
                  <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                      <li style={{ marginBottom: '1rem' }}><strong>Cost of membership:</strong> $49.99/month</li>
                      <li style={{ marginBottom: '1rem' }}><strong>Value of ONE solved blocker:</strong> 5+ hours of your time</li>
                      <li style={{ marginBottom: '1rem' }}><strong>At $50/hour:</strong> That's $250 in value. Per problem. Per month.</li>
                  </ul>
                  <p>You don't need this membership to be life-changing. You need it to solve ONE problem per month faster than you would alone. The rest is gravy.</p>
              </div>

              <div className="cta-container">
                  <a href="https://topaitools.dev/#/portal/signup/6855cc19f0c9910008da8f33/monthly" className="btn btn-primary" style={{ marginBottom: '16px' }}>Join The Builders Lab - $49.99/month</a>
                  <span className="bonus-badge">First 10 members get a free 1-hour 1-on-1 session ($175 value)</span>
              </div>

              <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center' }}>
                  <h3>Risk Reversal</h3>
                  <p>Try it for a month. Ask your questions. Use the tools. If you don't get value, cancel before month two. You'll have spent $50 to find out. That's the cost of a mediocre dinner.</p>
                  <p>But if you solve even one blocker faster - and you will - you'll make that back immediately.</p>
                  <p><strong>The risk isn't joining. The risk is another month of building alone.</strong></p>
              </div>
          </div>
      </section>

      {/* FOOTER */} 
      <footer className="footer">
          <div className="container">
              <p><strong>AI for Creative Marketers</strong></p>
              <p>Remote, all online | Cancel anytime</p>
              <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>joshua@craftedmarketing.solutions</p>
          </div>
      </footer>

      {/* EXIT INTENT POPUP */} 
      <div className="exit-popup-overlay" id="exitPopup">
          <div className="exit-popup">
              <button className="exit-popup-close" id="closePopup" aria-label="Close">&times;</button>
              <h3>Hey, before you go...</h3>
              <p>Get your free gift: <strong>The Builders Playbook</strong></p>
              <p style={{ fontSize: '14px', marginBottom: '24px' }}>Real strategies from solo builders who've solved the problems you're stuck on.</p>

              {/* MailerLite Embedded Form (Exit Popup) */} 
              <div id="mlb2-35300521" className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-35300521">
                <div className="ml-form-align-center">
                  <div className="ml-form-embedWrapper embedForm">
                    <div className="ml-form-embedBody ml-form-embedBodyDefault row-form">
                      <form className="ml-block-form" action="https://assets.mailerlite.com/jsonp/1387571/forms/175640406646588874/subscribe" method="post" target="_blank">       
                        <div className="ml-form-formContent">
                          <div className="ml-form-fieldRow ml-last-item">
                            <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                              <input aria-label="email" aria-required="true" type="email" className="form-control" name="fields[email]" placeholder="Enter your email" autoComplete="email" />
                            </div>
                          </div>
                        </div>
                        <input type="hidden" name="ml-submit" value="1" />
                        <div className="ml-form-embedSubmit">
                          <button type="submit" className="primary">Get The Playbook (Free)</button>
                        </div>
                        <input type="hidden" name="anticsrf" value="true" />
                      </form>
                    </div>
                    <div className="ml-form-successBody row-success" style={{ display: 'none' }}>
                      <div className="ml-form-successContent">
                        <h4>Perfect! Check your email.</h4>
                        <p>The Builders Playbook is on its way.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
      </div>
    </div>
  );
}
