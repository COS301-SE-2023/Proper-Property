import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  duration: '5m',
  vus: 5,
  thresholds: {
    http_req_duration: ['p(95)<500']
  },
};

export default function () {
  const res = http.get('http://localhost:4200');
  sleep(1);
}