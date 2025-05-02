# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install Gunicorn and Gevent
RUN pip install gunicorn gevent

# Copy the current directory contents into the container at /app
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ENV FLASK_APP=app_prod.py

# Use Gunicorn as the WSGI server for a production environment
CMD ["gunicorn", "-w", "4", "-k", "gevent", "-b", "0.0.0.0:8000", "--timeout", "3000", "--max-requests", "1000", "--max-requests-jitter", "50", "--limit-request-line", "4094", "app:app"]

