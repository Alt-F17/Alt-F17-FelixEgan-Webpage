import { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FaBrain, FaGitAlt, FaLanguage, FaPython, FaReact, FaShieldAlt } from 'react-icons/fa';
import { SiTypescript } from 'react-icons/si';
import type { IconType } from 'react-icons';
import { useLanguage } from '@/i18n/LanguageProvider';
import { portfolioCopy } from '@/content/portfolioCopy';
import type { Locale } from '@/i18n/types';

type Skill = {
	name: string;
	icon: IconType;
	description: Record<Locale, string>;
};

const skills: Skill[] = [
	{
		name: 'React & Next.js',
		icon: FaReact,
		description: {
			en: 'Modern, performant web apps — from client sites to full-stack projects.',
			fr: 'Applications web modernes et performantes — des sites clients aux projets full-stack.',
		},
	},
	{
		name: 'TypeScript & Tailwind',
		icon: SiTypescript,
		description: {
			en: 'Type-safe code and responsive design without the bloat.',
			fr: 'Code typé et design responsive sans lourdeur.',
		},
	},
	{
		name: 'Python & Automation',
		icon: FaPython,
		description: {
			en: 'Scripting, tooling, and backend workflows that save time.',
			fr: 'Scripts, outillage et workflows backend qui font gagner du temps.',
		},
	},
	{
		name: 'AI & Machine Learning',
		icon: FaBrain,
		description: {
			en: 'LLM integration, MCP orchestration, and intelligent tooling.',
			fr: "Intégration LLM, orchestration MCP et outillage intelligent.",
		},
	},
	{
		name: 'Cybersecurity',
		icon: FaShieldAlt,
		description: {
			en: 'Security-first development and vulnerability-aware engineering.',
			fr: 'Développement axé sécurité et ingénierie consciente des vulnérabilités.',
		},
	},
	{
		name: 'Open-Source & Git',
		icon: FaGitAlt,
		description: {
			en: 'Building and contributing to open-source projects with clean collaboration.',
			fr: 'Création et contribution à des projets open source avec une collaboration soignée.',
		},
	},
	{
		name: 'Bilingual Development',
		icon: FaLanguage,
		description: {
			en: 'FR/EN sites with proper i18n routing — a rare edge in Montreal.',
			fr: 'Sites FR/EN avec routage i18n propre — un avantage rare à Montréal.',
		},
	},
];

export const Skills = () => {
	const sectionRef = useRef<HTMLDivElement>(null);
	const cardsRef = useRef<HTMLDivElement[]>([]);
	const { locale } = useLanguage();
	const copy = portfolioCopy.skills;

	const addToCardsRef = (el: HTMLDivElement) => {
		if (el && !cardsRef.current.includes(el)) {
			cardsRef.current.push(el);
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

		cardsRef.current.forEach((card) => observer.observe(card));

		return () => {
			cardsRef.current.forEach((card) => observer.unobserve(card));
		};
	}, []);

	return (
		<section id="skills" className="section" ref={sectionRef}>
			<div className="container-padding max-w-5xl mx-auto">
				<h2 className="section-title">
					<span className="text-space-accent">/</span> {copy.title[locale]}
				</h2>
				<p className="section-subtitle">{copy.subtitle[locale]}</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{skills.map((skill, index) => (
						<div
							key={skill.name}
							ref={addToCardsRef}
							className="opacity-0 transform translate-y-4 transition-all duration-700 group"
							style={{ transitionDelay: `${index * 100}ms` }}
						>
							<Card className="bg-space-darker border-space-accent/20 lg:border-4 overflow-hidden relative">
								<div className="skill-shimmer" />
								<CardContent className="p-6">
									<div className="flex items-center mb-2">
										<skill.icon className="w-6 h-6 text-space-accent mr-3" />
										<h3 className="text-lg font-medium">{skill.name}</h3>
									</div>
									<p className="text-sm text-space-text/60">{skill.description[locale]}</p>
								</CardContent>
							</Card>
						</div>
					))}
				</div>

				<div
					ref={addToCardsRef}
					className="mt-12 opacity-0 transform translate-y-4 transition-all duration-700"
					style={{ transitionDelay: `${skills.length * 100}ms` }}
				>
					<Card className="bg-space-darker border-space-accent/20 lg:border-4">
						<CardContent className="p-6">
							<h3 className="text-xl font-medium mb-4">
								{copy.focusTitle[locale]}
							</h3>
							<ul className="space-y-3 list-disc list-inside text-space-text/80">
								{copy.focusItems[locale].map((item, index) => (
									<li key={index}>{item}</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
};

export default Skills;
