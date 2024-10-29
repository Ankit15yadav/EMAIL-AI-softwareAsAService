'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Bot, Zap, BarChart, ArrowRight, Shield, Cpu, FileText, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from "@clerk/nextjs"
import Link from 'next/link'

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string }> = ({ icon, title, description, color }) => (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <div className={`mr-2 p-2 rounded-full ${color}`}>
                    {icon}
                </div>
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription className="text-gray-600 dark:text-gray-400">
                {description}
            </CardDescription>
        </CardContent>
    </Card>
)

const LandingPage: React.FC = () => {
    const { user } = useUser()

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 grid grid-cols-12 gap-2 transform -skew-y-12 scale-150 opacity-5">
                {Array.from({ length: 144 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-300 dark:bg-gray-800"></div>
                ))}
            </div>

            <div className="relative z-10 container mx-auto px-4 py-16">
                {/* Hero Section */}
                <section className="text-center mb-20">
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        AI Email Assistant
                    </motion.h1>
                    <motion.p
                        className="text-xl mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Revolutionize your email experience with AI. Compose, analyze, and respond smarter.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex justify-center space-x-4"
                    >
                        <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                            <Link href="/mail">
                                Get Started
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-transparent border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                            <Link href="https://privacy-policy-ai-email.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center">
                                <FileText className="mr-2" /> Privacy Policy
                            </Link>
                        </Button>
                    </motion.div>
                </section>



                {/* Features Section */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Mail className="w-6 h-6 text-white" />}
                            title="AI Email Composition"
                            description="Craft perfect emails with AI assistance. Get suggestions, improve tone, and ensure clarity in your communication."
                            color="bg-blue-500"
                        />
                        <FeatureCard
                            icon={<Bot className="w-6 h-6 text-white" />}
                            title="Private Chatbot Assistant"
                            description="Access a private chatbot that can fetch and summarize important details from your emails without manual interaction."
                            color="bg-green-500"
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-white" />}
                            title="Smart Reply Suggestions"
                            description="Get intelligent reply suggestions based on the content of received emails, saving you time and effort."
                            color="bg-yellow-500"
                        />
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                    <Tabs defaultValue="compose" className="w-full">
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-gray-200 dark:bg-gray-900">
                            <TabsTrigger value="compose">Compose</TabsTrigger>
                            <TabsTrigger value="analyze">Analyze</TabsTrigger>
                            <TabsTrigger value="respond">Respond</TabsTrigger>
                        </TabsList>
                        <TabsContent value="compose" className="mt-6">
                            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-gray-900 dark:text-white">AI-Assisted Composition</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>Start writing your email</li>
                                        <li>AI suggests improvements in real-time</li>
                                        <li>Accept or modify suggestions</li>
                                        <li>Finalize and send your perfectly crafted email</li>
                                    </ol>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="analyze" className="mt-6">
                            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-gray-900 dark:text-white">Email Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>AI scans your inbox</li>
                                        <li>Important information is extracted</li>
                                        <li>Summaries are generated</li>
                                        <li>Access key details quickly through the chatbot</li>
                                    </ol>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="respond" className="mt-6">
                            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-gray-900 dark:text-white">Smart Responses</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>Receive an email</li>
                                        <li>AI analyzes the content</li>
                                        <li>Smart reply suggestions are generated</li>
                                        <li>Choose, modify, or write your own response</li>
                                    </ol>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </section>

                {/* One Policy Section */}
                <section className="mb-20">
                    <h2 className="text-4xl font-bold text-center mb-6">One Policy, Complete Protection</h2>
                    <p className="text-xl text-center mb-12 text-gray-600 dark:text-gray-400">
                        Revolutionizing email management by merging multiple features into one comprehensive solution.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-white" />}
                            title="Simplified Management"
                            description="Manage all your emails from a single, intuitive interface."
                            color="bg-yellow-500"
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-white" />}
                            title="Comprehensive Coverage"
                            description="From composition to analysis, we've got all your email needs covered."
                            color="bg-purple-500"
                        />
                        <FeatureCard
                            icon={<Cpu className="w-6 h-6 text-white" />}
                            title="24/7 AI Support"
                            description="Our AI assistant is always ready to help you manage your emails."
                            color="bg-pink-500"
                        />
                    </div>
                </section>

                {/* Statistics Section */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center text-4xl font-bold text-gray-900 dark:text-white">
                                    <BarChart className="mr-2 text-blue-500" /> 50%
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                                    Increase in email productivity
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center text-4xl font-bold text-gray-900 dark:text-white">
                                    100+
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                                    Emails processed daily
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center text-4xl font-bold text-gray-900 dark:text-white">
                                    99%
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                                    Customer satisfaction rate
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Data Usage Transparency Section */}
                <section className="mb-20 text-center">
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center text-gray-900 dark:text-white">
                                <Info className="mr-2" /> Why We Need Your Email Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                AI Email Assistant requires access to your email data to provide AI-powered email management, composition, and reply services. We use this data solely to enhance your email experience and do not share it with third parties. Your privacy and data security are our top priorities.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </section>

                {/* Call to Action Section */}
                <section className="text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Revolutionize Your Email Experience?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
                        Join thousands of users who have transformed their email management with our AI-powered tools.
                    </p>
                    <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        {user ? (
                            <Link href="/mail" className="flex items-center">
                                Mail Now <ArrowRight className="ml-2" />
                            </Link>
                        ) : (
                            <span className="flex items-center">Sign Up Now <ArrowRight className="ml-2" /></span>
                        )}
                    </Button>
                </section>
            </div>
        </div>
    )
}

export default LandingPage