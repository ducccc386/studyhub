import { ClassDto } from '../types/class';
import { TutorDto } from '../types/tutor';

export const MOCK_CLASSES: ClassDto[] = [
  {
    id: 1,
    tutorId: 1,
    title: "Ôn thi Đại học môn Toán - Lớp 12: Chuyên sâu Giải tích & Hình học",
    rating: "4.9",
    location: "Trực tuyến qua Zoom (Online)",
    locationType: "computer",
    tutorName: "Thầy Nguyễn Hoàng Nam",
    tutorDesc: "Thạc sĩ Toán học - ĐH Sư Phạm HN",
    tutorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBf8IwMybzeHQ58NopJnuBaSr81qhSa0FwewviuCcTnxfaVd0qGAsyeTbDXTyDavvtLVgmoYtYRV7hU5wICafi34zY4XiehqPSqldqT-G3__dLDoyAXSCamO4dOPXbEuPJRw9ILZhXkAtL68Us4oTUj3wcWR6oVZS7mMwweiQSsS-JI8SvPbzPUBTBs5m1piaN0XBmCIgugy1KcEsdHMPHUV0fe3oVsIitdyEJ5OVNTV1mV7R7PAGgFf6LyTlpUTOon0EPnZ34M48tx",
    price: "350.000đ",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKRBHavWds6K9jfgWlpBzmpW2bcbShYFBmG11tiOeWa4sEiq-e6KcwLHhVCUwqFzx9ofSC46l5s7wZe5pnDkEWAia15O_T1yM-Df3GJlK95VmalYW0qfkLd0JGCRtO1rBwfK583CY_FjeA91tcpcAoz2uHawaDVCvgTgtpXUkVKElw1fwuZQUBdeQu0yRXD8ZQ1MUB9QstQU6CYXsPImASVmdl9EACYQhnpy_p8_TH5jrarm7YirszgN7q2dyOmddkl6ObrQrI8q-O",
    schedule: "Thứ 2 - Thứ 4 - Thứ 6",
    sessionTime: "18:30 - 20:30",
    duration: "120 phút",
    totalSessions: "24 ca",
    maxStudents: 20,
    currentStudents: 15,
    tutorExperience: "8 năm kinh nghiệm",
    tutorVerified: true,
    requirements: [
      "Đã nắm vững kiến thức toán học cơ bản lớp 10 và 11.",
      "Có máy tính cầm tay (fx-580VNX hoặc tương đương).",
      "Tinh thần tự giác và hoàn thành bài tập về nhà đầy đủ."
    ],
    description: "Khóa học này được thiết kế đặc biệt dành cho học sinh lớp 12 đang chuẩn bị cho kỳ thi Tốt nghiệp THPT và xét tuyển Đại học. Chúng tôi sẽ tập trung vào các chuyên đề trọng tâm bao gồm: Khảo sát hàm số, Nguyên hàm - Tích phân, Số phức và Hình học không gian Oxyz.\n\nMỗi ca học sẽ kết hợp giữa lý thuyết cô đọng và thực hành giải các dạng đề thi minh họa của Bộ Giáo dục. Học sinh sẽ được tiếp cận với các phương pháp giải nhanh bằng máy tính cầm tay Casio và tư duy giải trắc nghiệm tối ưu."
  },
  {
    id: 2,
    tutorId: 2,
    title: "Bồi dưỡng HSG Vật lý 11",
    rating: "4.8",
    location: "Học qua Zoom/Google Meet (Online)",
    locationType: "videocam",
    tutorName: "Cô Trần Thị B",
    tutorDesc: "Thạc sĩ Vật Lý",
    tutorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtWYaJCa6CVLmXJeBcogl-hwVBngR75TCXiEeG8EjX4qyfHuMcnLmF6llde6IHrAj7xdBXVz2qaNtP5eag5C9zfmE9_BLP-yEiUjXMKhgdtNxdwibHzT8plxNXLwBJniUYoA2gj4LaOlGZAwzeNKhvxruqKdJ9_x1hWO6zs9jftFvJp7ZG5z22o7rtbC3rMg4M6-Sl9LqmMAvN-xMZ6Tgnb9LpB2h0YGDO9X6P_nbVWCG96PhCS_ysR2UgszVZUJn6CSatcSH_X1Ob",
    price: "180.000đ",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0f69dnQfJ4J7tMGzCDVUDr9QrHu6MhPL8RSrXeyhKggYa49aGkAkup2pCaB7gsHfmf6qQnuRzV7F9WDsVhMRMMHnkHj5bbXOMDqlKmj-ArRaFJc4Os_UnHbQbM6ypHHt2TeiWN_Z9-_bSfanI99Wq1jf5-LGj8L2zYS2srZpeSrsxeY3qfud2kErgJ9W2-VVh2Ki5F54OaTLKbw2cHufc1bE7XGdIwc55SvnNIb9C5amWlsoWG7fEAeNfyjYCKodQSagdvOJP-jOW",
    schedule: "Thứ 3 - Thứ 5",
    sessionTime: "19:30 - 21:30",
    duration: "120 phút",
    totalSessions: "16 ca",
    maxStudents: 10,
    currentStudents: 6,
    tutorExperience: "5 năm kinh nghiệm",
    tutorVerified: true,
    requirements: [
      "Đã học xong chương trình Vật lý lớp 10.",
      "Tư duy logic tốt, thích khám phá các hiện tượng tự nhiên."
    ],
    description: "Khóa học bồi dưỡng học sinh giỏi Vật lý 11 giúp các em tiếp cận với các dạng bài tập nâng cao, các chuyên đề cơ học, nhiệt học và điện học chuyên sâu. Lớp học giới hạn sĩ số để đảm bảo tương tác tốt nhất."
  },
  {
    id: 3,
    tutorId: 3,
    title: "IELTS General 6.5+ Cam kết",
    rating: "5.0",
    location: "Quận Bình Thạnh, TP.HCM (Offline)",
    locationType: "location_on",
    tutorName: "Mr. David Smith",
    tutorDesc: "Bản ngữ (USA), IELTS 9.0",
    tutorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdrfwB44ycnxTpwcPdtzbIEHqAaJTZvTu7uu9eXLC3zO82QWicHDpv35wxGqlugp1SNhCmi0gHzz1XMG7csf6To81y646g7B_pR8I42BVTE_-HftyZ5y_0Dgwu6PUC7ApkExse8kzD-6CVC7eD2yMAnz5plJtMzHaebeVrcZBJMlLQbbxKNLSbjEjC74T88lei8J2fhMm4rTygpM0TZIMvGhYL88or4jHhudnp-az6cZpI4tUhzABfONZmuzd_IBJn7JyTtsxFwopF",
    price: "450.000đ",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsww2u5oa5qwxVe-9bNPB_vQmei40EJ9TnSYcvnVRJkk3bFDSj9CvjB70quYnAN7W1VzBaM-X7f6R_zK5VSO5KVdjEqumY-iUfID7hBRJ4O-uXfXa8wlYYIYwUoQnm1nuI0USh6imog8j-QGEaLIJbxRilqjZcEJ7v3fUQiH8NALroXwMofFU7kVOkngI3szncaWKSa_0GJJS-iwzZD4dy2JAh9s_RexAzKOUVtETWMoQXeBk4tfIuwmtpavAoh-ftEW_hf4PLZ3hc",
    schedule: "Thứ Bảy - Chủ Nhật",
    sessionTime: "09:00 - 11:00",
    duration: "120 phút",
    totalSessions: "32 ca",
    maxStudents: 8,
    currentStudents: 5,
    tutorExperience: "10 năm kinh nghiệm",
    tutorVerified: true,
    requirements: [
      "Trình độ đầu vào tối thiểu tương đương IELTS 4.5.",
      "Cam kết đi học đầy đủ và làm bài tập writing hàng tuần."
    ],
    description: "Khóa học luyện thi IELTS General cam kết đầu ra 6.5+ dành cho người định cư hoặc làm việc nước ngoài. Tập trung sâu vào 2 kỹ năng Writing và Speaking dưới sự hướng dẫn của giáo viên bản ngữ."
  },
  {
    id: 4,
    tutorId: 4,
    title: "Lập trình Python cho người mới",
    rating: "4.7",
    location: "Học qua Discord (Online)",
    locationType: "videocam",
    tutorName: "Lê Minh C",
    tutorDesc: "Software Engineer at FPT",
    tutorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5SpdaJrBSDO6TXUmQ2SlYCdRDDWxKzBEpM6znI7vcTjAwDmvqVJuvRYlWVA6PYpr9U0IcudqUulAaDNxgOv7n-gaXOKOjBnfvxfMztQykB-H79pT4OUMjvsLk-AWvGD-tKSr4rVRO6RmkCepQFKtpubC8XYkU5pXnlUVnRHZxPMo2bYzVD94CxQX3VkWiLtMLgmzsFYIN6bQgpmNvFOwmI2N-7pCIKleQuN9Lcf9qzpvkQuHrDdTpnCGTv-8aiLGKrvjxAyA7KKDi",
    price: "300.000đ",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjFLIh2pu_Jq431A63HFR2hveAZoN897F8QGmNyORoSLdeu3cwywQSKa-41JU34EEVKnAHoIOAuOdfV1HfIO3HM21flDkt1n-oEB18dGUdpZHLqpV8YC-PDIn-31A-B8DfMck74UWpBK3R3rj0QyBFfE3bVP8p5dQHhIijC2Rsefpg43S5hyLpa02wJ6ZhC-9JAcpnnDS15I2yYrNic6g6n94G_Y5445Z2XXuXur8onu2fdUoibJ4mRMw-g2_FvwMMDVnListGPU3B",
    schedule: "Thứ 2 - Thứ 5",
    sessionTime: "20:00 - 22:00",
    duration: "120 phút",
    totalSessions: "20 ca",
    maxStudents: 15,
    currentStudents: 11,
    tutorExperience: "4 năm kinh nghiệm",
    tutorVerified: true,
    requirements: [
      "Không yêu cầu kiến thức lập trình trước.",
      "Máy tính cá nhân cài đặt sẵn VS Code hoặc PyCharm."
    ],
    description: "Khóa học Python căn bản trang bị tư duy lập trình cốt lõi, cú pháp Python, cách xử lý dữ liệu và làm quen với các thư viện phổ biến. Phù hợp cho học sinh, sinh viên và người đi làm chuyển ngành."
  }
];

export const MOCK_TUTORS: TutorDto[] = [
  {
    id: 1,
    name: "Nguyễn Thu Hà",
    rating: "4.9 (42)",
    title: "Sư phạm Toán - ĐH Sư Phạm HN",
    description: "Chuyên luyện thi Đại học khối A, A1 với hơn 5 năm kinh nghiệm. Phương pháp dạy tư duy mới giúp học sinh nắm vững bản chất...",
    tags: ["Toán học", "Luyện thi ĐH"],
    price: "250k",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAafkUxSEbecZeyzdQ4kmzN35u9l9kBfrGnMtR4KvGn5aE3AkkyKzCmopwLDJyt6vA5xFII7gr2d9puRHlHHXS0mNxWtvWou3c__njVrEXam9r1Q9B9Ws-IDgX6CwJ-zsGG2ug5k-9tSq43nFcfGW_30tLtFkCrrNblJ95WNtZXVDb1IIvpSqbvj24grKEXWt2lj3-o5JpQb6JVmZ2MY3zTQ_fKY_x77NPa8fLMboBFlvvE6SwvxYkdz1uY8OCxlUKqXwLlWWdPVInB",
    verified: true
  },
  {
    id: 2,
    name: "Trần Minh Hoàng",
    rating: "5.0 (28)",
    title: "IELTS 8.5 - ĐH Ngoại Thương",
    description: "Chuyên luyện thi IELTS Speaking & Writing. Cam kết đầu ra 6.5+ cho học sinh mất gốc. Lộ trình học cá nhân hóa...",
    tags: ["Tiếng Anh", "IELTS"],
    price: "400k",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9KPzsinuY3j52v2JxakeiWFDQmXeT12pHJPK441U8QGMNT3kIZ7X_g7hFt7_51HsGK1tYhqDcofz8iS4PDlaZ217KsZYhhbrjXQz_8oJMzXPKOmVkmrPZt7h2GuQWI3L8mmGfBrziDCxVtKbqJFev69rngZHPFOPWYVEbDMXzZ8i4nhWh0Az7vssahwoyBUuUoiyUz_2Rxolt8m2cBW7_XafR5NDrN9IJQ37_HTDLLcWQS5tj6f7kFPN65DWvg1PlUI14h8Xu_qAm",
    verified: true
  },
  {
    id: 3,
    name: "Lê Kim Chi",
    rating: "4.8 (19)",
    title: "Thạc sĩ Vật lý - ĐHQG TP.HCM",
    description: "Giải thích các hiện tượng vật lý khó hiểu một cách đơn giản nhất thông qua thực hành và ví dụ thực tế...",
    tags: ["Vật lý", "Cấp 3"],
    price: "300k",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBV8ceA3IBB1SW9rwqVyHnsUFek92-Dl_UGarnIjDhlNa49vTbOdiAsGkFIAuj-gusBJGgZhd2-0rL3jXarbmhMnoSjeipy9H1dzuAmRO8ihfAcwxprldKK4LGxryB74_UQ0of4WJpnKny_K0MZrHS6Swco-g_UxEmlj3keYxukp695awsPFWR88tUppOrgyF3bsO5_Cfx0dk9K58vYcnNvNDb8IYMCQJdvH2VcLAGApN_huyd-n_r40zsqJgtxMSUnc6mLy5RNhcx2",
    verified: true
  },
  {
    id: 4,
    name: "Phạm Quốc Bảo",
    rating: "4.7 (35)",
    title: "Kỹ thuật phần mềm - ĐH Bách Khoa",
    description: "Hướng dẫn lập trình từ cơ bản đến nâng cao (Python, C++, Java). Hỗ trợ làm đồ án và giải các bài tập chuyên sâu...",
    tags: ["Tin học", "Lập trình"],
    price: "350k",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDclWBf8M216xLWZzkpawSUpVNZUoQ--zEcrmQ6M40eyqC6aK8-nQHspZmWXkiu1SHmqVwWfyVSQfuOisZh3svnQR22pQHw-xhuJr1GMm_R3UBzUBtvVLOaQYBYKtML2_fAgj9NrELWkPo7Y5uPvtq5WGvzZiSwOo4vyVW4KPv2dujxkRtceeORXE6baqCzKRaW-3DxUeGl2oxv3wtj5HQPZNb2W3k-Ekfjb7xVITdkjAuATjC_b7yuzofs0zO5YYCStJoWXfqbjMiU",
    verified: true
  }
];
