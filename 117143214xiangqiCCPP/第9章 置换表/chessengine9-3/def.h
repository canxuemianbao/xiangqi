#ifndef _DUAN_DEFINE_2007_
#define _DUAN_DEFINE_2007_


typedef struct {
	unsigned char  from, to;
	unsigned char  capture;
	// �������ŷ����ַ�����ת��������1���ŷ��������ʱ��ʾ��4���ַ���������"long"�洢�ʹ�����������
	long Coord(void) const 
	{  // ���ŷ�ת�����ַ���
		char szRetVal[4];
		szRetVal[0] = (from % 16) - 3 + 'a';
		szRetVal[1] = '9' - (from / 16) + 3;
		szRetVal[2] = (to % 16) - 3 + 'a';
		szRetVal[3] = '9' - (to / 16) + 3;
		return *(long *) szRetVal;
	}
	void Move(long dwMoveStr) 
	{ // ���ַ���ת�����ŷ�
		char *ch;
		ch = (char *) &dwMoveStr;
		from = (ch[0] - 'a' + 3) + (('9' - ch[1] + 3) << 4);
		to = (ch[2] - 'a' + 3) + (('9' - ch[3] + 3) << 4);
	}	
}move;

const int NULL_MOVE = 0;               // ����(Null-Move)��������ʾû���ŷ�
const int NOVALUE = 9999;	//�������ֵ
const char PieceNumToType[48] = {
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6,
  0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6
};

#define hashEXACT 0 
#define hashALPHA 1 
#define hashBETA 2

typedef struct{ 
	unsigned __int64 check; 
	int value; 
	int depth;
	int flag;
}HashNode; 

#endif