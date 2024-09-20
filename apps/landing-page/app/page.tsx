import { Button } from '@/components/shared/ui/button';
import Header from '@/components/shared/Header';
import { LandingPrimaryTextCtaSection } from '@/components/landing/cta/LandingPrimaryCta';
import { LandingProductHuntAward } from '@/components/landing/social-proof/LandingProductHuntAward';
import { LandingSocialProof } from '@/components/landing/social-proof/LandingSocialProof';
import { LandingDiscount } from '@/components/landing/discount/LandingDiscount';
import LatestArticles from '@/components/blog/LatestArticles';
import { LandingProductFeature } from '@/components/landing/LandingProductFeature';
import { LandingProductFeatureKeyPoints } from '@/components/landing/LandingProductFeatureKeyPoints';
import { LandingSaleCtaSection } from '@/components/landing/cta/LandingSaleCta';
import { LandingTestimonialGrid } from '@/components/landing/testimonial/LandingTestimonialGrid';
import { LandingBandSection } from '@/components/landing/LandingBand';
import { LandingTestimonialReadMoreWrapper } from '@/components/landing/testimonial/LandingTestimonialReadMoreWrapper';
import { LandingFeatureList } from '@/components/landing/feature/LandingFeatureList';
import { LandingFaqCollapsibleSection } from '@/components/landing/LandingFaqCollapsible';
import { LandingSocialProofBand } from '@/components/landing/social-proof/LandingSocialProofBand';
import { LandingSocialProofBandItem } from '@/components/landing/social-proof/LandingSocialProofBandItem';

import {
  ChromeIcon,
  FigmaIcon,
  FramerIcon,
  GithubIcon,
  LayersIcon,
  LightbulbIcon,
  LineChartIcon,
  SparklesIcon,
  ThumbsUpIcon,
  ZapIcon,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col w-full items-center fancy-overlay">
      <LandingSocialProofBand invert={false} className="hidden md:flex">
        <LandingSocialProofBandItem>
          Fast, reliable, and secure
        </LandingSocialProofBandItem>

        <LandingSocialProofBandItem>
          Easy to use, easy to love
        </LandingSocialProofBandItem>

        <LandingSocialProofBandItem graphic="rating">
          99% customer satisfaction
        </LandingSocialProofBandItem>
      </LandingSocialProofBand>

      <Header className="mb-0 lg:mb-0" />

      <LandingPrimaryTextCtaSection
        title="Boost your productivity and stay on track"
        description="Your AI-Powered MacOS planner and focus tool."
        textPosition="left"
        withBackground
        leadingComponent={<LandingProductHuntAward />}
      >
        <Button size="xl" asChild>
          <a href="#">Buy now</a>
        </Button>

        <Button size="xl" asChild variant="outlinePrimary">
          <a href="#">Learn more</a>
        </Button>

        <LandingDiscount
          discountValueText="30% off"
          discountDescriptionText="for the first 10 customers (2 left)"
        />

        <LandingSocialProof
          className="w-full mt-12"
          showRating
          numberOfUsers={99}
          suffixText="happy users"
          avatarItems={[
            {
              imageSrc: 'https://picsum.photos/id/64/100/100',
              name: 'John Doe',
            },
            {
              imageSrc: 'https://picsum.photos/id/65/100/100',
              name: 'Jane Doe',
            },
            {
              imageSrc: 'https://picsum.photos/id/669/100/100',
              name: 'Alice Doe',
            },
          ]}
        />
      </LandingPrimaryTextCtaSection>

      <LandingProductFeature
        title="Intelligent Scheduling"
        descriptionComponent={
          <>
            <LandingProductFeatureKeyPoints
              keyPoints={[
                {
                  title: 'Smart Scheduling',
                  description:
                    'Plan your day with an intelligent scheduler that adapts to your habits and preferences.',
                },
                {
                  title: 'Real-Time Focus Timer',
                  description:
                    'Track your focus sessions in real-time and maintain your concentration on tasks effortlessly.',
                },
                {
                  title: 'Customizable Task Lists',
                  description:
                    'Create personalized task lists that reflect your priorities and goals, making tracking easier.',
                },
              ]}
            />

            <Button asChild>
              <a href="#">Buy now</a>
            </Button>

            <p className="text-sm">
              7 day free trial, no credit card required.
            </p>
          </>
        }
        imageSrc="/static/images/backdrop-19.webp"
        imageAlt="Screenshot of the product"
        imagePosition="left"
        imagePerspective="none"
      />

      <LandingProductFeature
        title="Task Prioritization"
        descriptionComponent={
          <>
            <p>
              Identify your most important tasks with Focu's intuitive priority
              system, helping you maintain clarity and ensure you're always
              working on what drives progress.
            </p>

            <LandingProductFeatureKeyPoints
              keyPoints={[
                {
                  title: 'Daily Insights',
                  description:
                    'Receive insights on your daily productivity trends and recommendations for improvement.',
                },
                {
                  title: 'Seamless Integration',
                  description:
                    'Integrate easily with other MacOS apps and services to keep all your information synchronized.',
                },
                {
                  title: 'Focus Modes',
                  description:
                    'Switch between different focus modes to tailor your work environment to your needs.',
                },
              ]}
            />

            <Button asChild variant="outlinePrimary">
              <a href="#">Learn more</a>
            </Button>

            <p className="text-sm">Get started with our free tier.</p>
          </>
        }
        imageSrc="/static/images/backdrop-20.webp"
        imageAlt="Screenshot of the product"
        imagePosition="right"
        imagePerspective="none"
        withBackground
        withBackgroundGlow
        variant="secondary"
        backgroundGlowVariant="secondary"
      />

      <LandingProductFeature
        title="Smart Notifications"
        descriptionComponent={
          <>
            <p>
              Receive timely reminders and alerts tailored to your workflow,
              ensuring you stay engaged without feeling overwhelmed by constant
              distractions.
            </p>

            <Button asChild variant="outlinePrimary">
              <a href="#">Learn more</a>
            </Button>

            <p className="text-sm">First month is on us.</p>
          </>
        }
        imageSrc="/static/images/backdrop-5.webp"
        imageAlt="Screenshot of the product"
        imagePosition="left"
        imagePerspective="none"
        variant="secondary"
      />

      <LandingBandSection
        title="4.9/5 stars"
        description="Our customers love our product."
        supportingComponent={
          <LandingSocialProof
            showRating
            numberOfUsers={99}
            avatarItems={[
              {
                imageSrc: 'https://picsum.photos/id/64/100/100',
                name: 'John Doe',
              },
              {
                imageSrc: 'https://picsum.photos/id/65/100/100',
                name: 'Jane Doe',
              },
              {
                imageSrc: 'https://picsum.photos/id/669/100/100',
                name: 'Alice Doe',
              },
            ]}
          />
        }
      />

      <LandingProductFeature
        title="Stay Focused"
        descriptionComponent={
          <>
            Achieve your goals with precision and clarity using Focu.
            <Button asChild variant="outlinePrimary">
              <a href="#">Learn more</a>
            </Button>
          </>
        }
        withBackground
        variant="secondary"
        imageSrc="/static/images/product-sample.webp"
        imageAlt="Screenshot of the product"
        imagePosition="center"
        textPosition="center"
      />

      <LandingSaleCtaSection
        title="Transform Your Workflow"
        description="Join countless others who have discovered a more structured way to navigate their workday. Sign up for Focu at focu.app and start your journey toward enhanced productivity today!"
        ctaHref={'#'}
        ctaLabel={'Pre-order now'}
        withBackgroundGlow
      />

      <LandingTestimonialReadMoreWrapper size="md">
        <LandingTestimonialGrid
          title="What Our Users Are Saying"
          description="Join countless satisfied users who have transformed their productivity with Focu."
          testimonialItems={[
            {
              name: 'Sarah J.',
              text: 'Focu has streamlined my day-to-day tasks. I never thought managing my time could feel this structured and enjoyable!',
              handle: '@sarah_j.',
              imageSrc: 'https://picsum.photos/id/64/100/100',
            },
            {
              name: 'Mark L.',
              text: "Since I started using Focu, I've seen a noticeable improvement in my focus and accountability. Highly recommended!",
              handle: '@mark_l.',
              imageSrc: 'https://picsum.photos/id/65/100/100',
            },
            {
              name: 'Jessica T.',
              text: 'The intuitive design of Focu makes planning so simple. I actually look forward to organizing my week now.',
              handle: '@jessica_t.',
              imageSrc: 'https://picsum.photos/id/669/100/100',
              featured: true,
            },
            {
              name: 'David K.',
              text: 'Focu helped me balance my personal and professional life. It’s like having a personal assistant on my Mac!',
              handle: '@david_k.',
              imageSrc: 'https://picsum.photos/id/829/100/100',
            },
            {
              name: 'Emily R.',
              text: 'I can’t believe how much more I accomplish daily. Focu is a game-changer for anyone struggling with procrastination.',
              handle: '@emily_r.',
              imageSrc: 'https://picsum.photos/100/100.webp?random=2',
            },
            {
              name: 'Ryan P.',
              text: 'With Focu, I have clarity on my goals and steps to take towards them. It’s a must-have for anyone serious about productivity.',
              handle: '@ryan_p.',
              imageSrc: 'https://picsum.photos/100/100.webp?random=3',
            },
          ]}
          withBackgroundGlow
          withBackground
        />
      </LandingTestimonialReadMoreWrapper>

      <LandingFeatureList
        title="Elevate Your Productivity with Focu"
        description="Focu combines intelligent planning and focus-enhancing tools, specifically designed for MacOS users. Stay organized and achieve more each day."
        featureItems={[
          {
            title: 'Smart Scheduling',
            description:
              'Plan your day with an intelligent scheduler that adapts to your habits and preferences.',
            icon: <LayersIcon />,
          },
          {
            title: 'Real-Time Focus Timer',
            description:
              'Track your focus sessions in real-time and maintain your concentration on tasks effortlessly.',
            icon: <LineChartIcon />,
          },
          {
            title: 'Customizable Task Lists',
            description:
              'Create personalized task lists that reflect your priorities and goals, making tracking easier.',
            icon: <SparklesIcon />,
          },
          {
            title: 'Daily Insights',
            description:
              'Receive insights on your daily productivity trends and recommendations for improvement.',
            icon: <LightbulbIcon />,
          },
          {
            title: 'Seamless Integration',
            description:
              'Integrate easily with other MacOS apps and services to keep all your information synchronized.',
            icon: <ZapIcon />,
          },
          {
            title: 'Focus Modes',
            description:
              'Switch between different focus modes to tailor your work environment to your needs.',
            icon: <ThumbsUpIcon />,
          },
          {
            title: 'Milestone Tracking',
            description:
              'Set milestones for long-term projects and celebrate your achievements as you progress.',
            icon: <ChromeIcon />,
          },
          {
            title: 'Pomodoro Technique Support',
            description:
              'Utilize the Pomodoro Technique to maintain productivity with structured work and break intervals.',
            icon: <FigmaIcon />,
          },
          {
            title: 'Intuitive Interface',
            description:
              'Enjoy a sleek and user-friendly interface designed to facilitate easy navigation and quick access.',
            icon: <FramerIcon />,
          },
        ]}
      />

      <LandingFaqCollapsibleSection
        title="Frequently Asked Questions"
        description="Find answers to your questions about Focu, your AI-Powered MacOS planner and focus tool."
        faqItems={[
          {
            question: 'What is Focu and how does it work?',
            answer:
              'Focu is an AI-powered productivity tool designed specifically for MacOS that helps you plan your tasks, set priorities, and stay focused. It uses smart algorithms to suggest optimal scheduling based on your habits and deadlines, allowing you to manage your time more effectively.',
          },
          {
            question: 'Can Focu integrate with other apps I use?',
            answer:
              'Yes! Focu seamlessly integrates with popular applications like Calendar, Mail, and Reminder apps. This means you can sync your tasks and deadlines without the need to switch between multiple platforms, keeping everything in one place for easier management.',
          },
          {
            question: 'Is my data secure with Focu?',
            answer:
              'Absolutely. Focu places a high priority on your privacy and data security. We employ advanced encryption and strict data management practices to ensure that your information remains confidential and protected at all times.',
          },
        ]}
        withBackground
      />

      <section className="wide-container mt-12">
        <LatestArticles />
      </section>
    </div>
  );
}
