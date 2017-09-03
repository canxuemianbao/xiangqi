
#include "def.h"
#include <stdio.h>
const int MaxValue = 3000;	//��ֵ���ֵ

class CBoard  
{
public:
	void NewGame();
	CBoard();
	virtual ~CBoard();


	//************************************************************************
	//                  ��������
	//************************************************************************

	int side;					// �ֵ��ķ��ߣ�0��ʾ�췽��1��ʾ�ڷ�
	unsigned char board[256];	// ��������
	unsigned char piece[48];	// ��������
	char FenString[128];		// �����FEN����ʽ

	move MoveStack[128];	// ִ�е��߷�ջ
	int StackTop;			// ջ��ָ��,ָ��ջ��Ԫ�ص���һλ��,=0��ʾջ��
	move BestMove;	//�����õ�������߷�
	int ply;		// ��ǰ�������
	int MaxDepth;	//����������
	int TotalMoveNum;	//��ǰ�������ߵĲ���

	//************************************************************************
	//                  ��������
	//************************************************************************

	// �����ʾ��غ���------------------------------------
	void ClearBoard();				// �����������
	void OutputBoard();				// �����������
	void OutputPiece();				// �����������
	char IntToChar(int a);			// ��������ֵת�����ַ�ֵ
	int CharToSubscript(char ch);	// FEN�������Ӷ�Ӧ�������±�
		//�±�0��1��2��3��4��5��6�ֱ��Ӧ��ʾ�����ˣ����������ڣ���

	void AddPiece(int pos, int pc);			// ��posλ����������pc
	void StringToArray(const char *FenStr); // ��FEN����ʾ�ľ���ת����һά����
	void ArrayToString();					// ��һά�����ʾ�ľ���ת����FEN��

	// �߷�������غ���-----------------------------------
	void InitGen();		//�߷�����ǰ�ĳ�ʼ������
	int SaveMove(unsigned char from, unsigned char to,move * mv);//�������ɵ��߷�,�ɹ�����1��ʧ�ܷ���0
	int GenAllMove(move * MoveArray);	//�������е��߷�
	void OutputMove(move * MoveArray, int MoveNum);//������е��߷�
	int Check(int lSide);		//���lSideһ���Ƿ񱻽������Ǳ���������1�����򷵻�0
	int LegalMove(move mv);		//�ж��߷��Ƿ����
	int HasLegalMove();			//�жϵ�ǰ�����Ƿ��к����߷���û��������

	// �������� ------------------------------------------
	short Eval();				// ��������
	int IntToSubscript(int a);	// ��������ֵת�����±�
		//�±�0��1��2��3��4��5��6�ֱ��Ӧ��ʾ�����ˣ����������ڣ���

	// ��������------------------------------------------
	void ComputerThink(int TimeLimit);	//����˼��
	int AlphaBetaSearch(int depth, int alpha, int beta);	// Alpha-Beta�����㷨
	bool MakeMove(move m);	// ִ���߷�
	void UnMakeMove();		// �����߷�
	void ChangeSide();		// �������巽

};

extern CBoard g_Board;
