# 📄 Guia de Upload de Arquivos para Business

## Endpoint: `POST /business/:id/files`

Este endpoint permite fazer upload de arquivos binários diretamente para o Google Cloud Storage e associá-los a um negócio.

### 🔐 Autenticação

O endpoint requer autenticação JWT:
- Header: `Authorization: Bearer <token>`

### 📤 Formato da Requisição

**Content-Type:** `multipart/form-data`

**Parâmetros:**
- **URL Parameter:** `id` (number) - ID do negócio
- **Form Field:** `file` (File) - Arquivo binário a ser enviado

### 📋 Exemplos de Uso

#### 1. JavaScript/TypeScript (Fetch API)

```javascript
const formData = new FormData();
formData.append('file', fileBlob, 'documento.pdf');

const response = await fetch('http://localhost:3000/business/123/files', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer seu_token_jwt',
    // NÃO inclua Content-Type - o browser definirá automaticamente com boundary
  },
  body: formData,
});

const result = await response.json();
console.log(result);
```

#### 2. JavaScript/TypeScript (Axios)

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('file', fileBlob, 'documento.pdf');

const response = await axios.post(
  'http://localhost:3000/business/123/files',
  formData,
  {
    headers: {
      'Authorization': 'Bearer seu_token_jwt',
      'Content-Type': 'multipart/form-data',
    },
  }
);

console.log(response.data);
```

#### 3. cURL

```bash
curl -X POST http://localhost:3000/business/123/files \
  -H "Authorization: Bearer seu_token_jwt" \
  -F "file=@/caminho/para/documento.pdf"
```

#### 4. Postman

1. **Method:** `POST`
2. **URL:** `http://localhost:3000/business/123/files`
3. **Headers:**
   - `Authorization`: `Bearer seu_token_jwt`
4. **Body:**
   - Selecione `form-data`
   - Key: `file` (tipo: File)
   - Value: Selecione o arquivo do seu computador

#### 5. React/Next.js (Frontend)

```typescript
const uploadFile = async (businessId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/business/${businessId}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload');
  }

  return await response.json();
};

// Uso
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    try {
      const result = await uploadFile(123, file);
      console.log('Arquivo enviado:', result);
    } catch (error) {
      console.error('Erro:', error);
    }
  }
};
```

### 📥 Resposta de Sucesso (201 Created)

```json
{
  "id": 1,
  "businessId": 123,
  "uploadBy": 5,
  "filename": "documento.pdf",
  "fileType": "application/pdf",
  "publicUrl": "https://storage.googleapis.com/bucket-name/uploads/5/1234567890-documento.pdf",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "uploader": {
    "id": 5,
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "message": "Arquivo associado ao negócio com sucesso"
}
```

### ❌ Respostas de Erro

#### 400 Bad Request - Arquivo não fornecido
```json
{
  "statusCode": 400,
  "message": "Arquivo não fornecido",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Tipo de arquivo não permitido
```json
{
  "statusCode": 400,
  "message": "Tipo de arquivo não permitido",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Arquivo excede tamanho máximo
```json
{
  "statusCode": 400,
  "message": "Arquivo excede o tamanho máximo permitido",
  "error": "Bad Request"
}
```

#### 401 Unauthorized - Usuário não autenticado
```json
{
  "statusCode": 401,
  "message": "Usuário não autenticado",
  "error": "Unauthorized"
}
```

#### 404 Not Found - Negócio não encontrado
```json
{
  "statusCode": 404,
  "message": "Negócio com ID 123 não encontrado",
  "error": "Not Found"
}
```

### ⚙️ Configurações

O endpoint respeita as seguintes variáveis de ambiente:

- `MAX_FILE_SIZE_BYTES`: Tamanho máximo do arquivo em bytes (padrão: 10MB = 10485760)
- `ALLOWED_MIME`: Tipos MIME permitidos (padrão: `image/*,application/pdf`)

### 🔄 Fluxo de Funcionamento

1. **Upload para GCP:** O arquivo é enviado para o Google Cloud Storage
2. **Validação:** O arquivo é validado (tamanho e tipo)
3. **Armazenamento:** O arquivo é armazenado no bucket configurado
4. **Associação:** O arquivo é associado ao negócio na tabela `business_files`
5. **Retorno:** Os dados do arquivo associado são retornados

### 📝 Notas Importantes

- O arquivo é automaticamente nomeado no GCP com o padrão: `uploads/{userId}/{timestamp}-{filename}`
- O `uploadBy` é obtido automaticamente do token JWT do usuário autenticado
- Apenas arquivos ativos (`isActive: true`) são retornados no `GET /business/:id`
- O endpoint valida automaticamente o tipo e tamanho do arquivo antes do upload

