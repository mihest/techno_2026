FROM python:3.12-slim

WORKDIR /accounts

# Копируем requirements (кешится!)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8081
CMD ["python", "-m", "src.main"]