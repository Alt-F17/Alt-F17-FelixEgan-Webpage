import React, { useRef, useEffect, FormEvent, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FaGithub, FaInstagram, FaDiscord, FaEnvelope, FaPaypal, FaCoffee } from 'react-icons/fa';
import { SiHackthebox } from 'react-icons/si';
import { useLanguage } from '@/i18n/LanguageProvider';
import { portfolioCopy } from '@/content/portfolioCopy';

export const Contact = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  const copy = portfolioCopy.contact;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const isFormValid = formData.name.trim() !== '' && 
                     formData.email.trim() !== '' && 
                     formData.message.trim() !== '';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const socials = [
    { name: 'GitHub', username: '@Alt-F17', url: 'https://github.com/Alt-F17', icon: 'github' },
    { name: 'HTB Academy', username: '@AltF17', url: 'https://app.hackthebox.com/profile/AltF17', icon: 'hackthebox' },
    { name: 'Instagram', username: '@felixegan_', url: 'https://instagram.com/felixegan_', icon: 'instagram' },
    { name: 'Discord', username: 'Alt_F17', url: 'https://discord.com/users/707956607123718174', icon: 'discord' },
    { name: 'Email', username: 'felix.egan@icloud.com', url: 'mailto:felix.egan@icloud.com', icon: 'email' }
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast({
      title: copy.sentTitle[locale],
      description: copy.sentBody[locale],
    });
    
    if (formRef.current) {
      formRef.current.reset();
      setFormData({ name: '', email: '', message: '' });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (contactRef.current) observer.observe(contactRef.current);
    if (socialRef.current) observer.observe(socialRef.current);
    if (supportRef.current) observer.observe(supportRef.current);

    return () => {
      if (contactRef.current) observer.unobserve(contactRef.current);
      if (socialRef.current) observer.unobserve(socialRef.current);
      if (supportRef.current) observer.unobserve(supportRef.current);
    };
  }, []);

  return (
    <section id="contact" className="section pb-24">
      <div className="container-padding max-w-5xl mx-auto">
        <h2 className="section-title">
          <span className="text-space-accent">/</span> {copy.title[locale]}
        </h2>
        <p className="section-subtitle">{copy.subtitle[locale]}</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8">
          <div 
            ref={contactRef}
            className="opacity-0 transform translate-y-4 transition-all duration-1000 md:col-span-3 w-full"
          >
            <Card className="bg-space-darker border-[#3b82f6]/20 border-4 w-full h-full">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-medium mb-6">{copy.sendMessage[locale]}</h3>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      {copy.yourName[locale]}
                    </label>
                    <Input
                      id="name"
                      placeholder={copy.yourName[locale]}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="bg-space-dark border-space-accent/30 focus:border-space-accent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      {copy.yourEmail[locale]}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="bg-space-dark border-space-accent/30 focus:border-space-accent"
                    />
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    <label htmlFor="message" className="block text-sm font-medium">
                      {copy.message[locale]}
                    </label>
                    <Textarea
                      id="message"
                      placeholder={copy.messagePlaceholder[locale]}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className="flex-1 bg-space-dark border-space-accent/30 focus:border-space-accent"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    disabled={!isFormValid}
                    onClick={() => {
                      if (!formRef.current || !isFormValid) return;
                      const name = formData.name;
                      const email = formData.email;
                      const message = formData.message;
                      const subject = `Message from ${name}`;
                      const body = `From: ${name}\n@: ${email}\n\n${message}`;
                      const mailtoLink = `mailto:felix.egan@icloud.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.location.href = mailtoLink;
                    }}
                    className={`w-full transition-all ${
                      isFormValid 
                        ? 'bg-space-accent hover:bg-space-accent/80 text-white' 
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {copy.send[locale]}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div 
            ref={socialRef}
            className="opacity-0 transform translate-y-4 transition-all duration-1000 delay-200 md:col-span-2 w-full"
          >
            <Card className="bg-space-darker border-[#3b82f6]/20 border-4 h-full w-full">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-medium mb-6">{copy.connect[locale]}</h3>
                
                <div className="space-y-3 sm:space-y-6">
                  {socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 sm:p-4 border-4 border-space-accent/20 rounded-md hover:bg-space-accent/10 transition-all duration-300"
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-space-accent/20 flex items-center justify-center mr-3 sm:mr-4">
                        {social.icon === 'github' && <FaGithub className="w-5 h-5 text-space-accent" />}
                        {social.icon === 'instagram' && <FaInstagram className="w-5 h-5 text-space-accent" />}
                        {social.icon === 'discord' && <FaDiscord className="w-5 h-5 text-space-accent" />}
                        {social.icon === 'email' && <FaEnvelope className="w-5 h-5 text-space-accent" />}
                        {social.icon === 'hackthebox' && <SiHackthebox className="w-5 h-5 text-space-accent" />}
                      </div>
                      
                      <div>
                        <h4 className="text-space-text font-medium">{social.name}</h4>
                        <p className="text-space-text/70 text-sm">{social.username}</p>
                      </div>
                      
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support My Work Section */}
        <div 
          ref={supportRef}
          className="opacity-0 transform translate-y-4 transition-all duration-1000 delay-400 mt-6 max-w-5xl mx-auto"
        >
          <Card className="bg-space-darker border-[#3b82f6]/20 border-4 w-full">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-medium mb-4">{copy.support[locale]}</h3>
              <div className="flex flex-wrap gap-6 justify-center">
                <a
                   href="https://paypal.me/altf17"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center text-space-text hover:text-space-accent transition-colors text-sm sm:text-base"
                 >
                  <FaPaypal className="w-5 h-5 mr-2 text-space-accent" />
                   <span className="mr-2">PayPal:</span>
                   <span className="text-space-accent">@Felix Egan</span>
                 </a>
                <a
                   href="https://coff.ee/alt.f17"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center text-space-text hover:text-space-accent transition-colors text-sm sm:text-base"
                 >
                  <FaCoffee className="w-5 h-5 mr-2 text-space-accent" />
                   <span className="mr-2">{copy.buyCoffee[locale]}</span>
                   <span className="text-space-accent">@alt-f17</span>
                 </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;
