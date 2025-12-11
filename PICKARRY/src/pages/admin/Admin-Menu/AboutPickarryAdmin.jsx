import React from 'react';
import { ArrowLeft, Target, Users, Award, Clock, Heart, Globe, Shield, Truck, Mail, Phone, MapPin } from 'lucide-react';


import LukePhoto from '../../../assets/images/luke.jpg';
import AbcedeePhoto from '../../../assets/images/tips.jpg';
import KentPhoto from '../../../assets/images/doms.jpg';
import JamesPhoto from '../../../assets/images/james.jpg';
import JustingPhoto from '../../../assets/images/justine.jpg';


const TeamMemberCard = ({ member, index }) => {
    return (
        <div className={`group card hover-lift ${member.isFounder ? 'border-2 border-teal-500' : ''}`}>


            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-lg border-2 border-gray-700">
                {member.photo ? (

                    <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {

                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.photo-fallback');
                            if (fallback) fallback.style.display = 'flex';
                        }}
                    />
                ) : null}


                <div className={`photo-fallback w-full h-full ${member.photo ? 'hidden' : 'flex'} items-center justify-center ${member.imageColor}`}>
                    <span className="text-white font-bold text-2xl">
                        {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                </div>
            </div>

            <h3 className="font-bold text-lg text-white mb-1 text-center">
                {member.name}
            </h3>
            <div className={`inline-block px-3 py-1 ${member.isFounder ? 'bg-gradient-to-r from-teal-500 to-blue-500' : 'bg-gray-700'} text-white text-sm font-semibold rounded-full mb-2 mx-auto block text-center`}>
                {member.role}
            </div>
            {member.isFounder && (
                <div className="bg-teal-500/20 text-teal-400 text-xs px-2 py-1 rounded-full text-center mb-2">
                    Founder
                </div>
            )}
            <p className="text-sm text-gray-400 text-center">
                {member.description}
            </p>
        </div>
    );
};

const AboutPickarry = ({ onBack }) => {
    const features = [
        {
            icon: Target,
            title: 'Our Mission',
            description: 'To provide fast, reliable, and affordable delivery services to every Filipino household and business.',
            color: 'from-blue-500 to-teal-400'
        },
        {
            icon: Users,
            title: 'Our Community',
            description: 'Serving thousands of customers and empowering local couriers across the Philippines.',
            color: 'from-purple-500 to-pink-400'
        },
        {
            icon: Award,
            title: 'Quality Service',
            description: 'Committed to excellence with 99% on-time delivery and 24/7 customer support.',
            color: 'from-amber-500 to-orange-400'
        },
        {
            icon: Clock,
            title: 'Always Available',
            description: 'Round-the-clock service to meet your delivery needs anytime, anywhere.',
            color: 'from-emerald-500 to-green-400'
        }
    ];

    const stats = [
        { number: '50K+', label: 'Happy Customers', icon: Users, color: 'bg-blue-500/20 text-blue-400' },
        { number: '10K+', label: 'Active Couriers', icon: Truck, color: 'bg-purple-500/20 text-purple-400' },
        { number: '500K+', label: 'Deliveries Made', icon: Shield, color: 'bg-amber-500/20 text-amber-400' },
        { number: '99%', label: 'Satisfaction Rate', icon: Heart, color: 'bg-rose-500/20 text-rose-400' }
    ];


    const teamMembers = [
        {
            name: 'Luke Zichri Cabatingan',

            description: 'Visionary leader with 10+ years in logistics technology',
            photo: LukePhoto,
            imageColor: 'bg-gradient-to-br from-blue-500 to-teal-400',
            // isFounder: true,
            iconColor: 'bg-blue-500/20 text-blue-400'
        },
        {
            name: 'Abcedee Desuyo',

            description: 'Tech expert specializing in scalable delivery solutions',
            photo: AbcedeePhoto,
            imageColor: 'bg-gradient-to-br from-purple-500 to-pink-400',
            isFounder: false,
            iconColor: 'bg-purple-500/20 text-purple-400'
        },
        {
            name: 'Kent Dominic Gayramara',

            description: 'Ensuring seamless delivery operations nationwide',
            photo: KentPhoto,
            imageColor: 'bg-gradient-to-br from-amber-500 to-orange-400',
            isFounder: false,
            iconColor: 'bg-amber-500/20 text-amber-400'
        },
        {
            name: 'James Anthony Juntilla',

            description: 'Building brand presence across the Philippines',
            photo: JamesPhoto,
            imageColor: 'bg-gradient-to-br from-emerald-500 to-green-400',
            isFounder: false,
            iconColor: 'bg-emerald-500/20 text-emerald-400'
        },
        {
            name: 'Justing Darryl Dacutan',

            description: 'Dedicated to providing exceptional customer service',
            photo: JustingPhoto, // Replace with actual import when you have the photo
            imageColor: 'bg-gradient-to-br from-red-500 to-rose-400',
            isFounder: false,
            iconColor: 'bg-rose-500/20 text-rose-400'
        }
    ];

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email',
            value: 'support@pickarry.com',
            color: 'bg-teal-500/20 text-teal-400'
        },
        {
            icon: Phone,
            title: 'Phone',
            value: '1-800-PICKARRY',
            color: 'bg-blue-500/20 text-blue-400'
        },
        {
            icon: MapPin,
            title: 'Address',
            value: 'Jasaan Misamis Oriental, Philippines',
            color: 'bg-purple-500/20 text-purple-400'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items- space-x-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors duration-200 hover-lift"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-300" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">About Pickarry</h1>
                        </div>
                    </div>
                    <p className="mt-2 text-gray-400 ml-14">
                        Learn more about our mission, values, and commitment to serving you better
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Team Section */}
                <div className="mb-16">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-500/20 rounded-xl mb-6">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">
                            Meet Our Leadership Team
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            The passionate individuals behind Pickarry's success story
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {teamMembers.map((member, index) => (
                            <TeamMemberCard key={index} member={member} index={index} />
                        ))}
                    </div>


                </div>

                {/* Rest of the component remains the same */}
                {/* Hero Section */}
                <div className="text-center mb-12 card p-8">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl mb-6">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Your Trusted Delivery Partner
                    </h2>
                    <p className="text-gray-300 max-w-3xl mx-auto">
                        Pickarry is revolutionizing the delivery industry in the Philippines by connecting
                        customers with reliable couriers for fast, secure, and affordable delivery services.
                        We bridge the gap between urban and rural communities, making delivery accessible to all.
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="card hover-lift text-center p-6"
                            >
                                <div className="inline-flex items-center justify-center p-3 rounded-xl mb-4">
                                    <div className={`p-3 rounded-lg ${stat.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-300 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group card hover-lift p-6"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-t-2xl"></div>
                                <div className={`p-3 bg-gradient-to-br ${feature.color} rounded-lg inline-flex mb-6`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Company Info */}
                <div className="mb-12">
                    <div className="card p-8">
                        <div className="flex items-center mb-6">
                            <div className="p-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg mr-4">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Our Story</h3>
                        </div>
                        <div className="prose prose-lg max-w-none">
                            <p className="text-gray-300 mb-6">
                                Founded in 2023, Pickarry started with a simple goal: to make delivery services
                                accessible to everyone. What began as a small team of passionate individuals
                                has grown into one of the fastest-growing delivery platforms in the Philippines.
                            </p>
                            <p className="text-gray-300 mb-6">
                                Today, we proudly serve both urban and rural communities, bridging the gap
                                between traditional logistics and modern technology. Our commitment to
                                innovation, reliability, and customer satisfaction drives everything we do.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                {[
                                    { value: '2023', label: 'Year Founded', color: 'bg-teal-500/20 text-teal-400' },
                                    { value: '81', label: 'Provinces Served', color: 'bg-blue-500/20 text-blue-400' },
                                    { value: '24/7', label: 'Service Availability', color: 'bg-purple-500/20 text-purple-400' }
                                ].map((item, index) => (
                                    <div key={index} className="text-center p-4 bg-gray-800/50 rounded-lg">
                                        <div className={`text-3xl font-bold mb-2 ${item.color.split(' ')[2]}`}>
                                            {item.value}
                                        </div>
                                        <div className="text-gray-300 font-medium">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="card p-8 mb-12">
                    <h3 className="text-2xl font-bold text-white mb-6">Get In Touch</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contactInfo.map((info, index) => {
                            const Icon = info.icon;
                            return (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-lg ${info.color.split(' ')[0]}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-semibold mb-1 text-gray-300">{info.title}</div>
                                        <div className="text-gray-400">{info.value}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-12 text-gray-500 border-t border-gray-800 pt-8">
                    <p className="text-sm">
                        © 2025 Pickarry Delivery Services. All rights reserved.
                        Making the Philippines more connected, one delivery at a time.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutPickarry;