import { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FaPython, FaHtml5, FaLinux, FaGitAlt, FaUserSecret, FaMicrochip } from 'react-icons/fa';
import { useLanguage } from '@/i18n/LanguageProvider';
import { portfolioCopy } from '@/content/portfolioCopy';

const skills = [
	{ name: 'Python Development', icon: FaPython, description: 'Scripting, automation, data pipelines, and application development.' },
	{ name: 'HTML/CSS', icon: FaHtml5, description: 'Responsive layouts, animations, and modern UI design.' },
	{ name: 'Machine Learning', icon: FaMicrochip, description: 'Model training, NLP, and working with local and cloud LLMs.' },
	{ name: 'Windows & Linux CLI', icon: FaLinux, description: 'Shell scripting, system administration, and terminal-first workflows.' },
	{ name: 'Git and Github', icon: FaGitAlt, description: 'Version control, branching strategies, and open-source collaboration.' },
	{ name: 'HackTheBox Academy', icon: FaUserSecret, description: 'Ethical hacking, penetration testing, and CTF challenges.' },
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
									<p className="text-sm text-space-text/60">{skill.description}</p>
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
