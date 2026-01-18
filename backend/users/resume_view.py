from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from .models import Education, JobHistory, Skill, Certification

class ResumeView(APIView):
    def get(self, request):
        user = request.user
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{user.username}_resume.pdf"'

        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter

        # --- Header ---
        y = height - 50
        p.setFont("Helvetica-Bold", 24)
        p.drawString(50, y, f"{user.username}") # Or user.first_name + last_name
        y -= 25
        p.setFont("Helvetica", 12)
        p.drawString(50, y, f"Email: {user.email}")
        y -= 20
        p.line(50, y, width - 50, y)
        y -= 30

        # --- Education ---
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, y, "Education")
        y -= 20
        p.setFont("Helvetica", 12)
        educations = user.education.all()
        for edu in educations:
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y, f"{edu.degree} - {edu.institution}")
            p.setFont("Helvetica", 10)
            p.drawRightString(width - 50, y, f"{edu.start_year} - {edu.end_year or 'Present'}")
            y -= 15
            if edu.grade:
                p.drawString(70, y, f"Grade: {edu.grade}")
                y -= 15
            if edu.cgpa:
                p.drawString(70, y, f"CGPA: {edu.cgpa}")
                y -= 15
            y -= 5
        y -= 10
        p.line(50, y, width - 50, y)
        y -= 30

        # --- Experience ---
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, y, "Work Experience")
        y -= 20
        jobs = user.job_history.all()
        for job in jobs:
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y, f"{job.role} - {job.company}")
            p.setFont("Helvetica", 10)
            p.drawRightString(width - 50, y, f"{job.start_date} - {job.end_date or 'Present'}")
            y -= 15
            if job.description:
                # Simple text wrapping could be added here, cutting off for MVP
                p.drawString(70, y, job.description[:100] + "..." if len(job.description) > 100 else job.description)
                y -= 15
            y -= 5
        y -= 10
        p.line(50, y, width - 50, y)
        y -= 30
        
        # --- Skills ---
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, y, "Skills")
        y -= 20
        p.setFont("Helvetica", 12)
        skills = user.skills.all()
        skill_text = ", ".join([f"{s.name} ({s.proficiency})" if s.proficiency else s.name for s in skills])
        p.drawString(50, y, skill_text)
        y -= 30
        p.line(50, y, width - 50, y)
        y -= 30

        # --- Certifications ---
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, y, "Certifications")
        y -= 20
        certs = user.certifications.all()
        for cert in certs:
             p.setFont("Helvetica-Bold", 12)
             p.drawString(50, y, f"{cert.name}")
             p.setFont("Helvetica", 10)
             p.drawRightString(width - 50, y, f"{cert.issuing_organization}, {cert.issue_date}")
             y -= 15
        
        p.showPage()
        p.save()
        return response
