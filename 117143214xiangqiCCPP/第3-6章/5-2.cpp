
const short PieceValue[8]={1000,20,20,40,90,45,10,0};
//棋子整数值转换成字符表示
int IntToSubscript(int a)
{
	if(a<16 && a>=48)
		return 7;
	
	if(a >=32)
		a = a-16;

	switch(a)
	{
	case 16:	return 0;
	case 17:
	case 18:	return 1;
	case 19:
	case 20:	return 2;
	case 21:
	case 22:	return 3;
	case 23:
	case 24:	return 4;
	case 25:
	case 26:	return 5;
	case 27:
	case 28:
	case 29:
	case 30:
	case 31:	return 6;
	default:	return 7;
	}

}

short Eval(void)
{
	int i;
	short bValue,wValue;

	bValue = wValue = 0;
	for(i=16; i<32; i++)
	{
		if(piece[i]>0)
			wValue = wValue + PieceValue[IntToSubscript(i)];
	}

	for(i=32; i<48; i++)
	{
		if(piece[i]>0)
			bValue = bValue + PieceValue[IntToSubscript(i)];
	}

	return wValue - bValue;
}
