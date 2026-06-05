import { NextRequest, NextResponse } from 'next/server';

interface PublishRequest {
  jobId: string;
  jobTitle: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  salary: string;
  channels: {
    careerPage: boolean;
    linkedin: boolean;
    twitter: boolean;
    facebook: boolean;
    email: boolean;
  };
  companySlug: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json();
    const {
      jobId,
      jobTitle,
      department,
      location,
      description,
      requirements,
      salary,
      channels,
      companySlug,
    } = body;

    const results: Record<string, { published: boolean; url?: string; error?: string }> = {};

    // Generate a job slug
    const jobSlug = jobTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const baseUrl = `https://careers.${companySlug}.com`;

    // Career Page
    if (channels.careerPage) {
      results.careerPage = {
        published: true,
        url: `${baseUrl}/jobs/${jobSlug}`,
      };
    }

    // LinkedIn
    if (channels.linkedin) {
      const linkedInText = encodeURIComponent(
        `🚀 We're hiring! ${jobTitle} - ${department}\n📍 ${location}\n💰 ${salary}\n\n${description.substring(0, 200)}...\n\nApply now: ${baseUrl}/jobs/${jobSlug}\n\n#Hiring #Jobs #${department.replace(/\s/g, '')} #Career`
      );
      results.linkedin = {
        published: true,
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${baseUrl}/jobs/${jobSlug}`)}`,
      };
    }

    // Twitter/X
    if (channels.twitter) {
      results.twitter = {
        published: true,
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 We're hiring ${jobTitle}! ${location} ${salary}. Apply now!`)}&url=${encodeURIComponent(`${baseUrl}/jobs/${jobSlug}`)}`,
      };
    }

    // Facebook
    if (channels.facebook) {
      results.facebook = {
        published: true,
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${baseUrl}/jobs/${jobSlug}`)}`,
      };
    }

    // Email template
    if (channels.email) {
      results.email = {
        published: true,
        url: `mailto:?subject=${encodeURIComponent(`Job Opening: ${jobTitle} at ${companySlug}`)}&body=${encodeURIComponent(
          `Hi,\n\nWe have an exciting opportunity at ${companySlug}!\n\nPosition: ${jobTitle}\nDepartment: ${department}\nLocation: ${location}\nSalary: ${salary}\n\n${description}\n\nRequirements:\n${requirements.map(r => `- ${r}`).join('\n')}\n\nApply here: ${baseUrl}/jobs/${jobSlug}\n\nBest regards,\n${companySlug} HR Team`
        )}`,
      };
    }

    // Generate embed snippet
    const embedSnippet = `<iframe src="${baseUrl}/jobs/${jobSlug}/embed" width="100%" height="600" frameborder="0" style="border-radius: 12px;"></iframe>`;

    return NextResponse.json({
      success: true,
      jobId,
      results,
      embedSnippet,
      jobUrl: `${baseUrl}/jobs/${jobSlug}`,
    });
  } catch (error) {
    console.error('JD publish error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish job description' },
      { status: 500 }
    );
  }
}
