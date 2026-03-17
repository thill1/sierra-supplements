import { NextResponse } from "next/server";
import { getTestimonials } from "@/lib/testimonials";

export async function GET() {
    const testimonials = await getTestimonials();
    return NextResponse.json(testimonials);
}
