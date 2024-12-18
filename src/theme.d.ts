import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypeBackground {
    server: string;
    client: string;
  }
  interface TypeText {
    server: string;
    client: string;
  }
}
