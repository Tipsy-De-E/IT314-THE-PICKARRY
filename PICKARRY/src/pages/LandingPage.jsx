import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Shield, Clock, Star, ArrowRight, ChevronRight, Play, Users, MapPin, Search, Home, Package, CreditCard } from 'lucide-react';
import { motion, useInView, useAnimation } from 'framer-motion';
import logo from '../assets/images/LOGO.png';
import '../styles/landing-page.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Refs for animations
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const testimonialsRef = useRef(null);
    const ctaRef = useRef(null);

    const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });
    const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.3 });
    const isTestimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.3 });
    const isCtaInView = useInView(ctaRef, { once: true, amount: 0.3 });

    const controls = useAnimation();

    const features = [
        {
            icon: <Truck className="feature-icon" size={24} />,
            title: 'Fast Delivery',
            description: 'Get your items delivered in minutes with our reliable courier network'
        },
        {
            icon: <Shield className="feature-icon" size={24} />,
            title: 'Secure & Safe',
            description: 'Your packages and payments are protected with advanced security'
        },
        {
            icon: <Clock className="feature-icon" size={24} />,
            title: '24/7 Service',
            description: 'Round-the-clock delivery service whenever you need it'
        },
        {
            icon: <Star className="feature-icon" size={24} />,
            title: 'Rated #1',
            description: 'Most trusted delivery service in Jasaan, Misamis Oriental'
        }
    ];

    const testimonials = [
        {
            name: 'Luke Zichri Cabatingan',
            role: 'Project Manager',
            text: 'Pickarry has transformed my small business. Fast, reliable, and affordable delivery!',
            rating: 5
        },
        {
            name: 'Abcedee Desuyo',
            role: 'Whoooo Seeeeee',
            text: 'Oh..REJECTION??? It`s My Hounor ;)',
            rating: 0
        },
        {
            name: 'Kent Dominic Gayramara',
            role: 'Regular Customer',
            text: 'The app is so easy to use and the couriers are always friendly and professional.',
            rating: 4
        },
        {
            name: 'James Anthony Juntilla',
            role: 'Regular Customer',
            text: 'The app is so easy to use and the couriers are always friendly and professional.',
            rating: 4
        },
        {
            name: 'Justin Daryl Dacutan',
            role: 'Regular Customer',
            text: 'The app is so easy to use and the couriers are always friendly and professional.',
            rating: 4
        }

    ];

    const stats = [
        { number: '10,000+', label: 'Deliveries Completed' },
        { number: '500+', label: 'Happy Customers' },
        { number: '50+', label: 'Active Couriers' },
        { number: '98%', label: 'Satisfaction Rate' }
    ];

    // Enhanced auto-rotate testimonials with pause on hover
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const handleGetStarted = async (isSignUp = true) => {
        setIsLoading(true);

        // Add a small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isSignUp) {
            navigate('/customer/auth', {
                state: { autoOpenSignUp: true }
            });
        } else {
            navigate('/customer/auth');
        }

        setIsLoading(false);
    };

    const handleSignIn = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        navigate('/customer/auth', {
            state: { autoOpenLogin: true }
        });
        setIsLoading(false);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
            >
                <Star
                    size={16}
                    className={i < rating ? "star-filled" : "star-empty"}
                    fill={i < rating ? "currentColor" : "none"}
                />
            </motion.div>
        ));
    };

    // Animation variants
    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    const staggerChildren = {
        animate: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const pulseAnimation = {
        initial: { scale: 1 },
        animate: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="landing-page">
            {/* Loading Overlay */}
            {isLoading && (
                <motion.div
                    className="loading-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="loading-spinner"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Truck size={32} />
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Taking you to Pickarry...
                    </motion.p>
                </motion.div>
            )}

            {/* Navigation */}
            <motion.nav
                className="landing-nav"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="nav-container">
                    <motion.div
                        className="nav-logo"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <img src={logo} alt="Pickarry" className="logo" />
                    </motion.div>
                    <div className="nav-links">
                        <motion.a
                            href="#features"
                            className="nav-link"
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                        >
                            Features
                        </motion.a>
                        <motion.a
                            href="#how-it-works"
                            className="nav-link"
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                        >
                            How It Works
                        </motion.a>
                        <motion.a
                            href="#testimonials"
                            className="nav-link"
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                        >
                            Reviews
                        </motion.a>
                        <motion.button
                            className="nav-button"
                            onClick={() => handleGetStarted(true)}
                            whileHover={{
                                scale: 1.05,
                                y: -2,
                                boxShadow: "0 12px 30px rgba(20, 184, 166, 0.5)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Get Started <ArrowRight size={16} />
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                className="hero-section"
                initial="initial"
                animate={isHeroInView ? "animate" : "initial"}
                variants={staggerChildren}
            >
                <div className="hero-container">
                    <motion.div
                        className="hero-content"
                        variants={fadeInUp}
                    >
                        <img src="/src/assets/images/THEPICKARRY.png" alt="Pickarry" className="landing-page-logo"></img>
                        <motion.div
                            className="hero-badge"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >

                            <MapPin size={16} />
                            <span>Now serving Jasaan, Misamis Oriental</span>
                        </motion.div>

                        <motion.h1
                            className="hero-title"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            We
                            <motion.span
                                className="gradient-text"
                                animate={{
                                    backgroundPosition: ['0%', '100%', '0%']
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            > _Pick </motion.span>
                            , We
                            <motion.span
                                className="gradient-text"
                                animate={{
                                    backgroundPosition: ['0%', '100%', '0%']
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            > _Carry </motion.span>
                            , You
                            <motion.span
                                className="gradient-text"
                                animate={{
                                    backgroundPosition: ['0%', '100%', '0%']
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >_Relax </motion.span>
                        </motion.h1>

                        <motion.p
                            className="hero-description"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            Connect with trusted couriers in your area for quick and secure package delivery.
                            Whether it's documents, groceries, or important items - we've got you covered.
                        </motion.p>

                        <motion.div
                            className="hero-actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <motion.button
                                className="primary-button"
                                onClick={() => handleSignIn(true)}
                                whileHover={{
                                    scale: 1.05,
                                    y: -2,
                                    boxShadow: "0 12px 30px rgba(34, 197, 94, 0.5)"
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Play size={20} />
                                    </motion.div>
                                ) : (
                                    <>
                                        Start Ordering <Play size={20} />
                                    </>
                                )}
                            </motion.button>
                            <motion.button
                                className="secondary-button"
                                onClick={handleSignIn}
                                whileHover={{
                                    scale: 1.05,
                                    y: -2,
                                    borderColor: "#14b8a6"
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Sign In <ArrowRight size={20} />
                            </motion.button>
                        </motion.div>

                        <motion.div
                            className="hero-stats"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                        >
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="stat-item"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 + index * 0.1 }}
                                >
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, x: 100, rotateY: 10 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        transition={{ delay: 0.6, duration: 1 }}
                    >
                        <motion.div
                            className="website-mockup"
                            whileHover={{ y: -10 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="browser-window">
                                <div className="browser-header">
                                    <div className="browser-controls">
                                        <div className="control-dot red"></div>
                                        <div className="control-dot yellow"></div>
                                        <div className="control-dot green"></div>
                                    </div>
                                    <div className="browser-url">
                                        <Search size={12} />
                                        <span>pickarry.com/delivery</span>
                                    </div>
                                </div>
                                <div className="browser-content">
                                    <motion.div
                                        className="mockup-app"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                    >
                                        <div className="app-header">
                                            <div className="app-logo">
                                                <img src={logo} alt="Pickarry" />
                                            </div>
                                            <div className="user-avatar">CS</div>
                                        </div>

                                        <div className="booking-form-mockup">
                                            <motion.div
                                                className="form-section"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.2 }}
                                            >
                                                <div className="input-group">
                                                    <Home size={16} />
                                                    <input type="text" placeholder="Where to pickup?" className="mock-input" />
                                                </div>
                                                <div className="input-group">
                                                    <MapPin size={16} />
                                                    <input type="text" placeholder="Where to deliver?" className="mock-input" />
                                                </div>
                                                <div className="input-group">
                                                    <Package size={16} />
                                                    <input type="text" placeholder="What to deliver?" className="mock-input" />
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className="service-options"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.4 }}
                                            >
                                                <div className="service-tabs">
                                                    <button className="service-tab active">Pasundo</button>
                                                    <button className="service-tab">Pasugo</button>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className="vehicle-selection-mockup"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.6 }}
                                            >
                                                <div className="vehicle-options">
                                                    {[
                                                        { icon: '🛺', type: 'Tricycle', price: '₱20' },
                                                        { icon: '🏍️', type: 'Motorcycle', price: '₱20' },
                                                        { icon: '🚐', type: 'Van', price: '₱25' }
                                                    ].map((vehicle, index) => (
                                                        <motion.div
                                                            key={index}
                                                            className="vehicle-option-mockup"
                                                            whileHover={{
                                                                scale: 1.1,
                                                                y: -5,
                                                                borderColor: "#14b8a6"
                                                            }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <div className="vehicle-icon">{vehicle.icon}</div>
                                                            <div className="vehicle-info">
                                                                <span className="vehicle-type">{vehicle.type}</span>
                                                                <span className="vehicle-price">{vehicle.price}</span>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className="payment-section"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.8 }}
                                            >
                                                <div className="payment-method">
                                                    <CreditCard size={16} />
                                                    <span>Cash on Delivery</span>
                                                </div>
                                                <motion.button
                                                    className="order-button-mockup"
                                                    whileHover={{
                                                        scale: 1.05,
                                                        y: -2,
                                                        boxShadow: "0 6px 20px rgba(34, 197, 94, 0.4)"
                                                    }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Order Now - ₱20
                                                </motion.button>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Features Section */}
            <motion.section
                ref={featuresRef}
                id="features"
                className="features-section"
                initial="initial"
                animate={isFeaturesInView ? "animate" : "initial"}
            >
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2>Why Choose Pickarry?</h2>
                        <p>Experience the future of local delivery with our innovative platform</p>
                    </motion.div>
                    <motion.div
                        className="features-grid"
                        variants={staggerChildren}
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="feature-card"
                                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.2,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                whileHover={{
                                    y: -10,
                                    scale: 1.05,
                                    boxShadow: "0 20px 40px rgba(20, 184, 166, 0.3)"
                                }}
                            >
                                <motion.div
                                    className="feature-icon-wrapper"
                                    whileHover={{
                                        scale: 1.1,
                                        rotate: 5
                                    }}
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* How It Works */}
            <section id="how-it-works" className="how-it-works-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2>How It Works</h2>
                        <p>Get your items delivered in just a few simple steps</p>
                    </motion.div>
                    <div className="steps-container">
                        {[
                            { number: '1', title: 'Set Pickup & Delivery', desc: 'Enter your pickup and delivery locations' },
                            { number: '2', title: 'Choose Your Service', desc: 'Select between Pasundo or Pasugo service' },
                            { number: '3', title: 'Select Vehicle', desc: 'Pick the best vehicle for your delivery needs' },
                            { number: '4', title: 'Track & Receive', desc: 'Track your delivery in real-time and receive your items' }
                        ].map((step, index) => (
                            <motion.div
                                key={index}
                                className="step"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                whileHover={{ x: 10 }}
                            >
                                <motion.div
                                    className="step-number"
                                    whileHover={{
                                        scale: 1.2,
                                        rotate: 360,
                                        transition: { duration: 0.5 }
                                    }}
                                >
                                    {step.number}
                                </motion.div>
                                <div className="step-content">
                                    <h3>{step.title}</h3>
                                    <p>{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <motion.section
                ref={testimonialsRef}
                id="testimonials"
                className="testimonials-section"
                initial="initial"
                animate={isTestimonialsInView ? "animate" : "initial"}
            >
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2>What Our Customers Say</h2>
                        <p>Join thousands of satisfied users in Jasaan</p>
                    </motion.div>
                    <div className="testimonials-container">
                        <div className="testimonials-slider">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    className={`testimonial-card ${index === currentSlide ? 'active' : ''}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: index === currentSlide ? 1 : 0,
                                        scale: index === currentSlide ? 1 : 0.8
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="testimonial-content">
                                        <div className="stars">
                                            {renderStars(testimonial.rating)}
                                        </div>
                                        <p>"{testimonial.text}"</p>
                                        <div className="testimonial-author">
                                            <strong>{testimonial.name}</strong>
                                            <span>{testimonial.role}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="slider-indicators">
                            {testimonials.map((_, index) => (
                                <motion.button
                                    key={index}
                                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                    whileHover={{ scale: 1.3 }}
                                    whileTap={{ scale: 0.8 }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                ref={ctaRef}
                className="cta-section"
                initial="initial"
                animate={isCtaInView ? "animate" : "initial"}
            >
                <div className="container">
                    <motion.div
                        className="cta-content"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.h2
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            Ready to Get Started?
                        </motion.h2>
                        <p>Join Pickarry today and experience fast, reliable delivery service</p>
                        <motion.div
                            className="cta-buttons"
                            variants={staggerChildren}
                        >
                            <motion.button
                                className="cta-primary"
                                onClick={() => handleGetStarted(true)}
                                whileHover={{
                                    scale: 1.05,
                                    y: -2,
                                    boxShadow: "0 12px 30px rgba(34, 197, 94, 0.5)"
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Sign Up Now <Users size={20} />
                            </motion.button>
                            <motion.button
                                className="cta-secondary"
                                onClick={handleSignIn}
                                whileHover={{
                                    scale: 1.05,
                                    y: -2,
                                    borderColor: "#14b8a6"
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Sign In <ArrowRight size={20} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Footer */}
            <motion.footer
                className="landing-footer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <img src={logo} alt="Pickarry" />
                            </div>
                            <p>Fast, reliable delivery service in Jasaan, Misamis Oriental</p>
                        </div>
                        <div className="footer-links">
                            <div className="link-group">
                                <h4>Company</h4>
                                <a href="#about">About Us</a>
                                <a href="#careers">Careers</a>
                                <a href="#contact">Contact</a>
                            </div>
                            <div className="link-group">
                                <h4>Services</h4>
                                <a href="#pasundo">Pasundo</a>
                                <a href="#pasugo">Pasugo</a>
                                <a href="#courier">Become a Courier</a>
                            </div>
                            <div className="link-group">
                                <h4>Support</h4>
                                <a href="#help">Help Center</a>
                                <a href="#privacy">Privacy Policy</a>
                                <a href="#terms">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 Pickarry. All rights reserved.</p>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
};

export default LandingPage;