#include <Windows.h>   
#include <stdio.h>   

void main()   
{   
	SECURITY_ATTRIBUTES sa,sb;     
	HANDLE hInputRead,hInputWrite;     
	HANDLE hOutputRead,hOutputWrite;     
    
	sa.nLength = sizeof(SECURITY_ATTRIBUTES);     
	sa.lpSecurityDescriptor = NULL;     
	sa.bInheritHandle = TRUE;     
	if(!CreatePipe(&hOutputRead,&hOutputWrite,&sa,0))     
	{     
		printf("Error On CreatePipe1");     
		return;     
	}     
    
	sb.nLength = sizeof(SECURITY_ATTRIBUTES);     
	sb.lpSecurityDescriptor = NULL;     
	sb.bInheritHandle = TRUE;     
	if(!CreatePipe(&hInputRead,&hInputWrite,&sb,0))     
	{     
		printf("Error On CreatePipe2");     
		return;     
	}     
    
	STARTUPINFO   si;     
	PROCESS_INFORMATION   pi;     
	si.cb = sizeof(STARTUPINFO);     
	GetStartupInfo(&si);     
	si.hStdError = hOutputWrite;     
	si.hStdOutput = hOutputWrite;     
	si.hStdInput = hInputRead;   
	si.wShowWindow = SW_HIDE;     
	si.dwFlags = STARTF_USESHOWWINDOW | STARTF_USESTDHANDLES;     
    
	//注意程序a的位置
	if(!CreateProcess(NULL,"E:\\a\\debug\\a.exe",NULL,NULL,TRUE,NULL,NULL,NULL,&si,&pi))   
	{   
		printf("Error On CreateProcess");     
		return;     
	}     
    
	CloseHandle(hInputRead);   
	CloseHandle(hOutputWrite);   
    
	DWORD dwWritten;   
	char   szInPut[10] = "12\r\n21\r\n";   
	WriteFile(hInputWrite, szInPut, strlen(szInPut), &dwWritten, NULL);   
    
    char buffer[4096] = {0};     
	DWORD bytesRead;     
	while(true)   
	{   
		if(ReadFile(hOutputRead,buffer,4095,&bytesRead,NULL) == NULL)     
		{   
			break;   
		}   
		
		printf(buffer);   
		Sleep(500);     
	}     
	
	CloseHandle(hInputWrite);   
	CloseHandle(hOutputRead);   
	getchar();
}   
