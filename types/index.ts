export interface Socials {
  email: string;
  linkedin: string;
  github: string;
}

export interface GeneralData {
  name: string;
  headline: string;
  about: string[];
  socials: Socials;
  navigation: {
    about: string;
    experiences: string;
    education: string;
    projects: string;
  };
  buttons: {
    getInTouch: string;
    github: string;
    linkedin: string;
    discoverWork: string;
    viewProjects: string;
  };
  sections: {
    about: string;
    experiences: string;
    education: string;
    projects: string;
  };
  greeting: {
    hello: string;
  };
}

export interface Experience {
  title: string;
  company: string;
  href: string;
  startDate: string;
  endDate: string;
  description: string;
  logo: string;
  skills: string[];
}

export interface Education {
  subject: string;
  degree: string;
  university: string;
  href: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  name: string;
  framework: string;
  description: string;
  href: string;
  stars: string;
}

export interface Translations {
  general: GeneralData;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
}
