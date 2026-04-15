import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Briefcase, Zap, Star, CheckCircle, TrendingUp, Users, Building, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.6, ease: "easeOut" }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-700/50 rounded-2xl glass mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
      >
        <span className="font-semibold text-lg text-slate-200">{question}</span>
        <Plus className={`w-5 h-5 text-brand-400 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="px-6 overflow-hidden text-slate-400"
      >
        <p className="pb-4">{answer}</p>
      </motion.div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-background relative selection:bg-brand-500/30 selection:text-brand-200 scroll-smooth pb-0">
      
      {/* Global Background Ambient Orbs */}
      <div className="absolute top-0 left-[-10%] w-[50%] h-[500px] bg-brand-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[400px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div 
          custom={1} initial="hidden" animate="visible" variants={fadeUp}
          className="inline-flex flex-col items-center gap-2 px-5 py-2.5 rounded-full glass border-brand-500/30 text-brand-300 text-sm font-medium mb-8 cursor-default"
        >
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> <span>Next Gen AI Hiring</span></div>
        </motion.div>

        <motion.h1 
          custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tight mb-8 leading-[1.1] max-w-5xl"
        >
          Your Future, Engineered by <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-blue-400">
            Intelligent Matching
          </span>
        </motion.h1>

        <motion.p 
          custom={3} initial="hidden" animate="visible" variants={fadeUp}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Upload your resume and let our proprietary AI NLP engine connect you instantly with top-tier companies looking for your exact skill set. No more endless searching.
        </motion.p>

        <motion.div 
          custom={4} initial="hidden" animate="visible" variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto"
        >
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transform hover:-translate-y-1 flex items-center justify-center gap-2">
            Upload Resume <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/jobs" className="w-full sm:w-auto px-8 py-4 rounded-xl glass hover:bg-surface-hover border-slate-600 hover:border-slate-500 text-white font-semibold transition-all flex items-center justify-center gap-2 group">
            Browse Jobs <Briefcase className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
          </Link>
        </motion.div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="py-10 border-y border-slate-800/50 bg-surface/20 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { label: 'Active Jobs', val: '12,400+', icon: <Briefcase /> },
              { label: 'Top Recruiters', val: '850+', icon: <Building /> },
              { label: 'Success Matches', val: '98%', icon: <CheckCircle /> },
              { label: 'Active Candidates', val: '45k+', icon: <Users /> }
            ].map((stat, idx) => (
              <motion.div key={idx} variants={fadeUp} className="flex flex-col items-center gap-2">
                <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400 mb-2">{stat.icon}</div>
                <h3 className="text-4xl font-heading font-bold text-white">{stat.val}</h3>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURED JOBS SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Featured Opportunities</h2>
            <p className="text-slate-400 text-lg">Hand-picked roles from top tech companies.</p>
          </div>
          <Link to="/jobs" className="hidden md:flex text-brand-400 hover:text-brand-300 font-medium items-center gap-1 group">
            View all jobs <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { role: 'Senior Frontend Engineer', company: 'Google', type: 'Remote', salary: '$140k - $190k' },
            { role: 'AI Research Scientist', company: 'OpenAI', type: 'San Francisco', salary: '$200k - $300k' },
            { role: 'Product Designer', company: 'Spotify', type: 'Hybrid', salary: '$120k - $160k' },
            { role: 'Backend Lead', company: 'Netflix', type: 'Remote', salary: '$170k - $220k' },
            { role: 'DevOps Engineer', company: 'Amazon', type: 'Seattle', salary: '$130k - $180k' },
            { role: 'Data Engineer', company: 'Meta', type: 'Remote', salary: '$150k - $200k' },
          ].map((job, i) => (
            <motion.div 
              key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="glass p-6 rounded-2xl border border-slate-700/50 hover:border-brand-500/50 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-surface p-3 rounded-xl border border-slate-700">
                  <Briefcase className="w-6 h-6 text-brand-400" />
                </div>
                <span className="px-3 py-1 bg-brand-500/10 text-brand-300 text-xs font-semibold rounded-full">New</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-400 transition-colors">{job.role}</h3>
              <p className="text-slate-400 mb-4">{job.company}</p>
              <div className="flex items-center gap-4 text-sm text-slate-300 mb-6 font-medium">
                <span className="bg-surface/50 px-3 py-1 rounded-lg border border-slate-700/50">{job.type}</span>
                <span className="bg-surface/50 px-3 py-1 rounded-lg border border-slate-700/50">{job.salary}</span>
              </div>
              <Link to="/register" className="block w-full py-2.5 text-center bg-brand-600/10 hover:bg-brand-600 text-brand-400 hover:text-white rounded-xl transition-colors font-medium border border-brand-500/20">
                Apply easily with AI
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className="py-24 relative bg-surface/30 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Why our AI makes a difference</h2>
            <p className="text-slate-400 text-lg">Traditional job portals rely on keywords. We rely on contextual understanding of your skills and career trajectory.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-yellow-400" />, title: "Instant Analysis", desc: "Our engine parses 50+ data points from your resume in milliseconds." },
              { icon: <TrendingUp className="text-blue-400" />, title: "Skill Gap Insights", desc: "Discover exactly what certifications or skills you need for your dream role." },
              { icon: <CheckCircle className="text-green-400" />, title: "Automated Applications", desc: "Apply to multiple matched roles simultaneously with one click." }
            ].map((feat, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="glass-card p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                  {feat.icon}
                </div>
                <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mb-6 border border-slate-700 shadow-lg">
                  {feat.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TOP RECRUITERS LOGO CLOUD */}
      <section className="py-20 px-4 max-w-7xl mx-auto text-center z-10 relative">
        <p className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-8">Trusted by industry leaders</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Placeholder for logos */}
          {['Google', 'Microsoft', 'Meta', 'Amazon', 'Apple', 'Netflix'].map(name => (
            <div key={name} className="text-2xl font-heading font-bold text-slate-300">{name}</div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-center mb-16">Stories of Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { name: "Sarah Jenkins", role: "Frontend Developer", txt: "The AI matched my obscure modern framework skills to a highly specific role at a top startup. I got hired in 3 days." },
            { name: "Michael Chen", role: "Data Scientist", txt: "It accurately parsed my academic papers from my resume and highlighted them heavily to research labs. Incredible tool." }
          ].map((testi, i) => (
            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="glass p-8 rounded-3xl border border-brand-500/20 relative">
              <Star className="absolute top-8 right-8 text-yellow-500/20 w-16 h-16" />
              <div className="flex items-center gap-1 mb-4 text-yellow-400">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-lg text-slate-300 mb-6 relative z-10">"{testi.txt}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-lg text-white">
                  {testi.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white">{testi.name}</h4>
                  <p className="text-xs text-brand-400">{testi.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-24 bg-surface/30 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about our AI hiring platform.</p>
          </div>
          
          <div className="space-y-4">
             <FAQItem question="How does the AI Resume Analyzer work?" answer="Our NLP algorithms extract critical data points including hard skills, soft skills, and career progression, assigning a competence vector that is then mathematically matched against job description vectors from employers." />
             <FAQItem question="Is this platform free for students?" answer="Yes! Core access and the AI resume analysis tool are completely free for all candidates. Premium features for deep interview coaching are available via subscription." />
             <FAQItem question="Are recruiters actively using this?" answer="Absolutely. Over 850 active recruiters utilize our AI Dashboard daily to find candidates that exactly match their obscure requirements without manually filtering." />
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER SECTION */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="glass border border-brand-500/30 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 to-transparent pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6">Stay ahead of the curve</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">Subscribe to our newsletter for the latest AI-curated job alerts, career tips, and tech industry insights.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 bg-surface/50 border border-slate-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder-slate-400"
            />
            <button className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.5)]">
              Subscribe
            </button>
          </div>
        </motion.div>
      </section>

      {/* 9. FOOTER SECTION */}
      <footer className="border-t border-slate-800 bg-background pt-16 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link gap-2 className="flex items-center gap-3 mb-4">
              <div className="bg-brand-500/20 p-2 rounded-xl"><Briefcase className="h-5 w-5 text-brand-400" /></div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">AI Job Portal</span>
            </Link>
            <p className="text-slate-400 max-w-md">Bridging the gap between extraordinary talent and leading tech enterprises using advanced AI matching algorithms.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/jobs" className="hover:text-brand-400 transition-colors">Find Jobs</Link></li>
              <li><Link to="/companies" className="hover:text-brand-400 transition-colors">Top Companies</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-400 transition-colors">Pricing</Link></li>
              <li><Link to="/features" className="hover:text-brand-400 transition-colors">AI Features</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-400 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2026 AI Job Portal. All rights reserved.</p>
          <div className="flex gap-4">
            {/* Social Icons Placeholder */}
            <div className="w-8 h-8 rounded-full bg-surface border border-slate-700 flex items-center justify-center hover:bg-brand-500/20 hover:text-brand-400 cursor-pointer transition-colors" />
            <div className="w-8 h-8 rounded-full bg-surface border border-slate-700 flex items-center justify-center hover:bg-brand-500/20 hover:text-brand-400 cursor-pointer transition-colors" />
            <div className="w-8 h-8 rounded-full bg-surface border border-slate-700 flex items-center justify-center hover:bg-brand-500/20 hover:text-brand-400 cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
