"use client"

import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription } from "@/components/ui/animated-card";
import { FloatingElements, GradientOrb, AnimatedBackground } from "@/components/ui/floating-elements";
import { FadeIn, StaggeredAnimation } from "@/components/ui/page-transition";
import { Smartphone, Globe, Zap, Sparkles, Rocket, Shield, ArrowRight, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5">
        <AnimatedBackground variant="dots" />
        <FloatingElements count={8} />
        <GradientOrb size="xl" color="primary" className="top-10 right-10" />
        <GradientOrb size="lg" color="secondary" className="bottom-20 left-10" />
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 container mx-auto px-4 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="relative">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Zap className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Wing App
              </h1>
              <p className="text-xs text-muted-foreground">Next-gen platform</p>
            </div>
          </motion.div>
          
          <AnimatedButton 
            variant="glow" 
            size="sm"
            animation="scale"
            className="shadow-lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get Started
          </AnimatedButton>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center max-w-6xl mx-auto">
          <FadeIn delay={0.2}>
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Star className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">
                Revolutionizing Cross-Platform Development
              </span>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Cross-Platform
              </span>
              <br />
              <motion.span 
                className="block bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent animate-gradient"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                Made Beautiful
              </motion.span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the future of app development with stunning visuals, 
              fluid animations, and seamless cross-platform deployment.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.8}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Link href="/login">
                <AnimatedButton 
                  size="lg" 
                  variant="gradient"
                  animation="scale"
                  className="text-lg px-10 py-4 w-full sm:w-auto shadow-2xl"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch App
                  <ArrowRight className="w-5 h-5 ml-2" />
                </AnimatedButton>
              </Link>
              <a href="https://capacitorjs.com" target="_blank" rel="noreferrer">
                <AnimatedButton 
                  variant="outline" 
                  size="lg" 
                  animation="scale"
                  className="text-lg px-10 py-4 w-full sm:w-auto glass hover-lift"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Learn More
                </AnimatedButton>
              </a>
            </div>
          </FadeIn>

          {/* Feature Cards */}
          <StaggeredAnimation staggerDelay={0.2} className="grid md:grid-cols-3 gap-8 mt-20">
            <AnimatedCard 
              variant="glass" 
              className="hover-lift group cursor-pointer"
              delay={0}
            >
              <AnimatedCardHeader className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Globe className="w-8 h-8 text-primary" />
                </motion.div>
                <AnimatedCardTitle className="text-2xl mb-3">Web Ready</AnimatedCardTitle>
                <AnimatedCardDescription className="text-base leading-relaxed">
                  Lightning-fast performance with Next.js 15, App Router, and modern web standards for exceptional user experiences.
                </AnimatedCardDescription>
              </AnimatedCardHeader>
            </AnimatedCard>

            <AnimatedCard 
              variant="glass" 
              className="hover-lift group cursor-pointer"
              delay={1}
            >
              <AnimatedCardHeader className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Smartphone className="w-8 h-8 text-secondary" />
                </motion.div>
                <AnimatedCardTitle className="text-2xl mb-3">Mobile Native</AnimatedCardTitle>
                <AnimatedCardDescription className="text-base leading-relaxed">
                  True native iOS and Android experiences with Capacitor integration and platform-specific optimizations.
                </AnimatedCardDescription>
              </AnimatedCardHeader>
            </AnimatedCard>

            <AnimatedCard 
              variant="glass" 
              className="hover-lift group cursor-pointer"
              delay={2}
            >
              <AnimatedCardHeader className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Shield className="w-8 h-8 text-accent" />
                </motion.div>
                <AnimatedCardTitle className="text-2xl mb-3">Enterprise Ready</AnimatedCardTitle>
                <AnimatedCardDescription className="text-base leading-relaxed">
                  Built with TypeScript, Supabase, and industry-leading security practices for mission-critical applications.
                </AnimatedCardDescription>
              </AnimatedCardHeader>
            </AnimatedCard>
          </StaggeredAnimation>
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 container mx-auto px-4 py-12 mt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div className="text-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
          <p className="text-muted-foreground">
            Crafted with ❤️ using Next.js, Capacitor, Framer Motion, and Supabase
          </p>
          <div className="flex justify-center items-center mt-4 space-x-2">
            <motion.div
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-secondary rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div
              className="w-2 h-2 bg-accent rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            />
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
